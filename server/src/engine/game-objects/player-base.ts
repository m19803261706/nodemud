/**
 * PlayerBase - 玩家基类
 *
 * 所有玩家对象的基类，继承 LivingBase。
 * 绑定 WebSocket Session，提供消息发送、连接管理、权限等能力。
 *
 * 对标: LPC user.c / 炎黄 USER
 */
import { QUALITY_MULTIPLIER, mergeBonus, type EquipmentBonus } from '@packages/core';
import { LivingBase } from './living-base';
import { RemainsBase } from './remains-base';
import { RoomBase } from './room-base';
import { ServiceLocator } from '../service-locator';
import { Permission } from '../types/command';
import { ArmorBase } from './armor-base';
import { WeaponBase } from './weapon-base';
import { GameEvents } from '../types/events';

/** 复活地点 */
const REVIVE_ROOM = 'area/rift-town/square';

export class PlayerBase extends LivingBase {
  /** 玩家可克隆（非虚拟对象） */
  static virtual = false;

  /** WebSocket 发送回调 */
  private _sendCallback: ((data: any) => void) | null = null;

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
   * 攻击力 = strength*2 + 装备攻击加成
   * 玩家的 strength 存储在 dbase 'strength' 中（由角色创建时写入）
   */
  getAttack(): number {
    const base = super.getAttack();
    const bonus = this.getEquipmentBonus();
    return base + (bonus.combat?.attack || 0);
  }

  /**
   * 防御力 = vitality*1.5 + 装备防御加成
   */
  getDefense(): number {
    const base = super.getDefense();
    const bonus = this.getEquipmentBonus();
    return base + (bonus.combat?.defense || 0);
  }

  /**
   * 玩家死亡：标记死亡状态 + 创建空残骸
   * 不立即复活 — 由 CombatManager.endCombat() 在战斗结束后调用 revive()
   */
  die(): void {
    super.die();
    const env = this.getEnvironment();

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
