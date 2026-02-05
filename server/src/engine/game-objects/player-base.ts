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
import { Permission } from '../types/command';
import { ArmorBase } from './armor-base';
import { WeaponBase } from './weapon-base';

export class PlayerBase extends LivingBase {
  /** 玩家可克隆（非虚拟对象） */
  static virtual = false;

  /** WebSocket 发送回调 */
  private _sendCallback: ((data: any) => void) | null = null;

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

  /** 玩家永不自毁（生命周期由连接管理） */
  public onCleanUp(): boolean {
    return false;
  }
}
