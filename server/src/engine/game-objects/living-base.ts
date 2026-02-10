/**
 * LivingBase -- 生物基类
 *
 * 所有"活着的"游戏对象（玩家、NPC）的基类。
 * 提供名字/描述、移动、指令执行、权限、装备系统等通用能力。
 *
 * 对标: LPC living.c / 炎黄 LIVING
 */
import { BaseEntity } from '../base-entity';
import { ServiceLocator } from '../service-locator';
import type { CommandResult } from '../types/command';
import { Permission } from '../types/command';
import type { ItemBase } from './item-base';

/** 装备槽位常量 */
const WEAR_POSITIONS = {
  HEAD: 'head',
  BODY: 'body',
  HANDS: 'hands',
  FEET: 'feet',
  WAIST: 'waist',
  WEAPON: 'weapon',
  OFFHAND: 'offhand',
  NECK: 'neck',
  FINGER: 'finger',
  WRIST: 'wrist',
} as const;

export class LivingBase extends BaseEntity {
  /** 装备槽位 Map */
  private _equipment: Map<string, ItemBase | null> = new Map([
    [WEAR_POSITIONS.HEAD, null],
    [WEAR_POSITIONS.BODY, null],
    [WEAR_POSITIONS.HANDS, null],
    [WEAR_POSITIONS.FEET, null],
    [WEAR_POSITIONS.WAIST, null],
    [WEAR_POSITIONS.WEAPON, null],
    [WEAR_POSITIONS.OFFHAND, null],
    [WEAR_POSITIONS.NECK, null],
    [WEAR_POSITIONS.FINGER, null],
    [WEAR_POSITIONS.WRIST, null],
  ]);

  /** 获取名字（对标 LPC query("name")） */
  getName(): string {
    return this.get<string>('name') ?? '无名';
  }

  /** 获取简短描述（房间内显示） */
  getShort(): string {
    return this.get<string>('short') ?? this.getName();
  }

  /** 获取详细描述（look 查看） */
  getLong(): string {
    return this.get<string>('long') ?? `你看到了${this.getName()}。`;
  }

  /**
   * 向指定方向移动
   * @param direction 方向（如 "north", "south"）
   * @returns 是否移动成功
   */
  async go(direction: string): Promise<boolean> {
    const env = this.getEnvironment();
    // 延迟加载 RoomBase 避免循环依赖
    const { RoomBase } = require('./room-base');
    if (!(env instanceof RoomBase)) return false;

    const room = env as import('./room-base').RoomBase;
    const targetId = room.getExit(direction);
    if (!targetId) return false;

    if (!ServiceLocator.initialized) return false;
    const targetRoom = ServiceLocator.blueprintFactory.getVirtual(targetId);
    if (!targetRoom) return false;

    return this.moveTo(targetRoom);
  }

  /**
   * 执行指令
   * @param input 玩家输入的原始指令字符串
   * @returns 指令执行结果
   */
  executeCommand(input: string): CommandResult {
    if (!ServiceLocator.initialized || !ServiceLocator.commandManager) {
      return { success: false, message: '指令系统未初始化' };
    }
    return ServiceLocator.commandManager.execute(this, input);
  }

  /** 获取权限等级 */
  getPermission(): Permission {
    return this.get<number>('permission') ?? Permission.NPC;
  }

  /** 接收消息（子类覆写实现消息推送） */
  receiveMessage(msg: string): void {}

  // ========== 装备系统 ==========

  /** 装备物品到指定槽位 */
  equip(item: ItemBase, position: string): boolean {
    if (!this._equipment.has(position)) return false;
    if (this._equipment.get(position) !== null) return false;
    this._equipment.set(position, item);
    return true;
  }

  /** 脱下指定槽位的装备 */
  unequip(position: string): ItemBase | null {
    if (!this._equipment.has(position)) return null;
    const item = this._equipment.get(position) ?? null;
    if (item) {
      this._equipment.set(position, null);
    }
    return item;
  }

  /** 获取所有装备槽位 */
  getEquipment(): Map<string, ItemBase | null> {
    return this._equipment;
  }

  /** 查找已装备的物品 */
  findEquipped(predicate: (item: ItemBase) => boolean): [string, ItemBase] | null {
    for (const [pos, item] of this._equipment) {
      if (item && predicate(item)) return [pos, item];
    }
    return null;
  }

  // ========== 战斗属性 ==========

  /**
   * 攻击力 = strength * 2
   * 基础实现仅使用 dbase 中的属性值，PlayerBase 覆写添加装备加成
   */
  getAttack(): number {
    const strength = this.get<number>('strength') || 0;
    return strength * 2;
  }

  /**
   * 防御力 = vitality * 1.5
   * 基础实现仅使用 dbase 中的属性值，PlayerBase 覆写添加装备加成
   */
  getDefense(): number {
    const vitality = this.get<number>('vitality') || 0;
    return Math.floor(vitality * 1.5);
  }

  /**
   * 战斗速度 = perception*3 + spirit*2 + strength*1 + meridian*1
   * 综合反映角色的反应速度和内力流转
   * 最低保底: level * 3（确保没有四维属性的 NPC 也能参与战斗）
   */
  getCombatSpeed(): number {
    const perception = this.get<number>('perception') || 0;
    const spirit = this.get<number>('spirit') || 0;
    const strength = this.get<number>('strength') || 0;
    const meridian = this.get<number>('meridian') || 0;
    const calculated = perception * 3 + spirit * 2 + strength * 1 + meridian * 1;
    const level = this.get<number>('level') || 1;
    return Math.max(calculated, level * 3);
  }

  /** 获取银两（最小为 0，按整数处理） */
  getSilver(): number {
    const value = this.get<number>('silver') ?? 0;
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.floor(value));
  }

  /** 增减银两，返回变更后余额 */
  addSilver(delta: number): number {
    if (!Number.isFinite(delta) || delta === 0) return this.getSilver();
    const next = Math.max(0, this.getSilver() + Math.floor(delta));
    this.set('silver', next);
    return next;
  }

  /** 扣除银两（余额不足返回 false） */
  spendSilver(amount: number): boolean {
    if (!Number.isFinite(amount)) return false;
    const cost = Math.max(0, Math.floor(amount));
    if (cost === 0) return true;
    const current = this.getSilver();
    if (current < cost) return false;
    this.set('silver', current - cost);
    return true;
  }

  /** 恢复生命值（返回实际恢复量） */
  recoverHp(amount: number): number {
    return this.recoverResource('hp', 'max_hp', amount);
  }

  /** 恢复内力（返回实际恢复量） */
  recoverMp(amount: number): number {
    return this.recoverResource('mp', 'max_mp', amount);
  }

  /** 恢复精力（返回实际恢复量） */
  recoverEnergy(amount: number): number {
    return this.recoverResource('energy', 'max_energy', amount);
  }

  /**
   * 恢复资源通用逻辑：
   * - 当前值不存在时按 0 处理
   * - max 存在时做上限钳制
   * - 返回实际恢复量
   */
  private recoverResource(currentKey: string, maxKey: string, amount: number): number {
    if (amount <= 0) return 0;
    const current = this.get<number>(currentKey) ?? 0;
    const max = this.get<number>(maxKey);
    const target = typeof max === 'number' ? Math.min(current + amount, max) : current + amount;
    this.set(currentKey, target);
    return Math.max(0, target - current);
  }

  /**
   * 受到伤害
   * 扣减当前 HP，降至 0 时触发死亡
   * @param amount 伤害值（正数）
   */
  receiveDamage(amount: number): void {
    const currentHp = this.get<number>('hp') || 0;
    const newHp = Math.max(0, currentHp - amount);
    this.set('hp', newHp);
    if (newHp <= 0) {
      this.die();
    }
  }

  /**
   * 死亡处理（子类覆写实现具体逻辑）
   * 基础实现：将战斗状态设为 dead
   */
  die(): void {
    this.setTemp('combat/state', 'dead');
  }

  /** 检查是否在战斗中 */
  isInCombat(): boolean {
    return this.getTemp<string>('combat/state') === 'fighting';
  }

  /** 获取战斗状态: idle | fighting | dead */
  getCombatState(): string {
    return this.getTemp<string>('combat/state') || 'idle';
  }
}
