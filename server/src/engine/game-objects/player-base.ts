/**
 * PlayerBase - 玩家基类
 *
 * 所有玩家对象的基类，继承 LivingBase。
 * 绑定 WebSocket Session，提供消息发送、连接管理、权限等能力。
 *
 * 对标: LPC user.c / 炎黄 USER
 */
import { LivingBase } from './living-base';
import { Permission } from '../types/command';
import type { ItemBase } from './item-base';

/** 装备槽位常量 */
export const WearPositions = {
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

export type WearPosition = (typeof WearPositions)[keyof typeof WearPositions];

export class PlayerBase extends LivingBase {
  /** 玩家可克隆（非虚拟对象） */
  static virtual = false;

  /** WebSocket 发送回调 */
  private _sendCallback: ((data: any) => void) | null = null;

  /** 装备槽位 Map */
  private _equipment: Map<string, ItemBase | null> = new Map([
    [WearPositions.HEAD, null],
    [WearPositions.BODY, null],
    [WearPositions.HANDS, null],
    [WearPositions.FEET, null],
    [WearPositions.WAIST, null],
    [WearPositions.WEAPON, null],
    [WearPositions.OFFHAND, null],
    [WearPositions.NECK, null],
    [WearPositions.FINGER, null],
    [WearPositions.WRIST, null],
  ]);

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

  /** 玩家永不自毁（生命周期由连接管理） */
  public onCleanUp(): boolean {
    return false;
  }
}
