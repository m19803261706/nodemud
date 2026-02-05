/**
 * ArmorBase — 防具基类
 * 所有防具物品的基类，提供防御力、穿戴位置等属性访问
 */
import { parseRawBonus, type EquipmentBonus } from '@packages/core';
import { ItemBase } from './item-base';

export class ArmorBase extends ItemBase {
  static virtual = false;

  /** 获取防御力 */
  getDefense(): number {
    return this.get<number>('defense') ?? 0;
  }

  /** 获取穿戴位置（body/head/hands 等） */
  getWearPosition(): string {
    return this.get<string>('wear_position') ?? 'body';
  }

  /** 获取属性加成（结构化） */
  getAttributeBonus(): EquipmentBonus {
    const raw = this.get<Record<string, number>>('attribute_bonus') ?? {};
    return parseRawBonus(raw);
  }

  /** 防具可装备 */
  override getActions(): string[] {
    return ['装备', ...super.getActions()];
  }
}
