/**
 * PlayerBase - 玩家基类
 *
 * 所有玩家对象的基类，继承 LivingBase。
 * 绑定 WebSocket Session，提供消息发送、连接管理、权限等能力。
 * 持有 SkillManager 实例，负责技能生命周期（加载、死亡惩罚、保存）。
 *
 * 对标: LPC user.c / 炎黄 USER
 */
import {
  QUALITY_MULTIPLIER,
  mergeBonus,
  MessageFactory,
  type EquipmentBonus,
  type SkillBonusSummary,
} from '@packages/core';
import { Logger } from '@nestjs/common';
import { LivingBase } from './living-base';
import { RemainsBase } from './remains-base';
import { RoomBase } from './room-base';
import { ServiceLocator } from '../service-locator';
import { Permission } from '../types/command';
import { ArmorBase } from './armor-base';
import { WeaponBase } from './weapon-base';
import { GameEvents } from '../types/events';
import { SkillManager } from '../skills/skill-manager';

/** 复活地点 */
const REVIVE_ROOM = 'area/rift-town/square';

export class PlayerBase extends LivingBase {
  /** 玩家可克隆（非虚拟对象） */
  static virtual = false;

  private readonly logger = new Logger(PlayerBase.name);

  /** WebSocket 发送回调 */
  private _sendCallback: ((data: any) => void) | null = null;

  /** 技能管理器（登录进场后初始化） */
  public skillManager: SkillManager | null = null;

  constructor(id: string) {
    super(id);
    // 统一桥接房间广播事件到客户端消息
    this.on(GameEvents.MESSAGE, (payload: { message?: string } | string) => {
      if (typeof payload === 'string') {
        this.receiveMessage(payload);
        return;
      }
      const message = payload?.message;
      if (typeof message === 'string') {
        this.receiveMessage(message);
      }
    });
  }

  /** 绑定连接（玩家上线时调用） */
  bindConnection(sendCallback: (data: any) => void): void {
    this._sendCallback = sendCallback;
  }

  /** 解绑连接（玩家下线时调用） */
  unbindConnection(): void {
    this._sendCallback = null;
  }

  /** 是否在线 */
  isConnected(): boolean {
    return this._sendCallback !== null;
  }

  /** 向客户端发送数据 */
  sendToClient(data: any): void {
    if (this._sendCallback) {
      this._sendCallback(data);
    }
  }

  /** 接收消息（覆写 LivingBase，转发到客户端） */
  receiveMessage(msg: string): void {
    this.sendToClient({ type: 'message', data: { content: msg } });
  }

  /** 获取权限等级（覆写 LivingBase，默认 PLAYER） */
  getPermission(): Permission {
    return this.get<number>('permission') ?? Permission.PLAYER;
  }

  // ========== 技能系统集成 ==========

  /**
   * 初始化技能管理器
   * 在角色进入游戏时调用，从数据库加载技能并推送 skillList 给客户端
   * @param characterId 角色 ID
   */
  async initSkillManager(characterId: string): Promise<void> {
    if (!ServiceLocator.skillService || !ServiceLocator.skillRegistry) {
      this.logger.warn('技能服务未初始化，跳过 SkillManager 加载');
      return;
    }

    this.skillManager = new SkillManager(
      this,
      ServiceLocator.skillService,
      ServiceLocator.skillRegistry,
    );

    // 从数据库加载技能数据
    await this.skillManager.loadFromDatabase(characterId);

    // 向客户端推送完整技能列表
    const listData = this.skillManager.buildSkillListData();
    const msg = MessageFactory.create('skillList', listData);
    if (msg) {
      this.sendToClient(MessageFactory.serialize(msg));
    }
  }

  /**
   * 保存技能数据到数据库
   * 在断线/退出时调用
   */
  async saveSkills(): Promise<void> {
    if (!this.skillManager) return;
    try {
      await this.skillManager.saveToDatabase();
    } catch (err) {
      this.logger.error('保存技能数据失败:', err);
    }
  }

  // ========== 技能查询覆写（委托给 SkillManager） ==========

  /** 获取指定技能的等级（覆写 LivingBase） */
  getSkillLevel(skillId: string): number {
    return this.skillManager?.getSkillLevel(skillId) ?? 0;
  }

  /** 获取指定槽位的有效技能等级（覆写 LivingBase） */
  getEffectiveLevel(slotType: string): number {
    return this.skillManager?.getEffectiveLevel(slotType as any) ?? 0;
  }

  /**
   * 获取技能属性加成汇总
   * 如果 skillManager 未初始化，返回全零加成
   */
  getSkillBonusSummary(): SkillBonusSummary {
    if (!this.skillManager) {
      return {
        attack: 0,
        defense: 0,
        dodge: 0,
        parry: 0,
        maxHp: 0,
        maxMp: 0,
        critRate: 0,
        hitRate: 0,
      };
    }
    return this.skillManager.getSkillBonusSummary();
  }

  // ========== 装备加成（仅玩家需要） ==========

  /** 汇总所有装备属性加成（含品质系数） */
  getEquipmentBonus(): EquipmentBonus {
    const total: EquipmentBonus = {
      attrs: {},
      resources: { maxHp: 0, maxMp: 0, maxEnergy: 0 },
      combat: { attack: 0, defense: 0 },
    };
    for (const [, item] of this.getEquipment()) {
      if (!item) continue;

      const quality = item.getQuality();
      const multiplier = QUALITY_MULTIPLIER[quality] ?? 1.0;

      let bonus: EquipmentBonus;
      if (item instanceof ArmorBase) {
        bonus = item.getAttributeBonus();
        const defense = item.getDefense();
        if (defense > 0) {
          bonus.combat = bonus.combat ?? {};
          bonus.combat.defense = (bonus.combat.defense ?? 0) + defense;
        }
      } else if (item instanceof WeaponBase) {
        bonus = item.getAttributeBonus();
      } else {
        continue;
      }

      mergeBonus(total, bonus, multiplier);
    }
    return total;
  }

  // ========== 战斗属性覆写（含装备加成） ==========

  /**
   * 攻击力 = strength*2 + 装备攻击加成 + 技能攻击加成
   * 玩家的 strength 存储在 dbase 'strength' 中（由角色创建时写入）
   */
  getAttack(): number {
    const base = super.getAttack();
    const equipBonus = this.getEquipmentBonus();
    const skillBonus = this.getSkillBonusSummary();
    return base + (equipBonus.combat?.attack || 0) + skillBonus.attack;
  }

  /**
   * 防御力 = vitality*1.5 + 装备防御加成 + 技能防御加成
   */
  getDefense(): number {
    const base = super.getDefense();
    const equipBonus = this.getEquipmentBonus();
    const skillBonus = this.getSkillBonusSummary();
    return base + (equipBonus.combat?.defense || 0) + skillBonus.defense;
  }

  /**
   * 玩家死亡：标记死亡状态 + 创建空残骸 + 技能死亡惩罚
   * 不立即复活 — 由 CombatManager.endCombat() 在战斗结束后调用 revive()
   */
  die(): void {
    super.die();
    const env = this.getEnvironment();

    // 技能死亡惩罚（SkillManager 内部会推送 skillUpdate 消息）
    if (this.skillManager) {
      this.skillManager.applyDeathPenalty();
    }

    // 创建空残骸（不转移物品，后续版本再定）
    const remainsId = ServiceLocator.objectManager.nextInstanceId('remains');
    const remains = new RemainsBase(remainsId, this.getName());
    ServiceLocator.objectManager.register(remains);
    remains.enableHeartbeat(1000);

    // 残骸放入当前房间（在 revive 传送之前）
    if (env && env instanceof RoomBase) {
      remains.moveTo(env, { quiet: true });
    }
  }

  /**
   * 复活：以 30% maxHp 复活，传送到新手村广场
   * 由 CombatManager 在战败结算后调用
   */
  async revive(): Promise<void> {
    const maxHp = this.get<number>('max_hp') || 100;
    const reviveHp = Math.floor(maxHp * 0.3);
    this.set('hp', reviveHp);
    this.setTemp('combat/state', 'idle');

    // 传送到复活点
    if (ServiceLocator.initialized && ServiceLocator.blueprintFactory) {
      const room = ServiceLocator.blueprintFactory.getVirtual(REVIVE_ROOM);
      if (room) {
        await this.moveTo(room, { quiet: true });
      }
    }
  }

  /** 玩家永不自毁（生命周期由连接管理） */
  public onCleanUp(): boolean {
    return false;
  }
}
