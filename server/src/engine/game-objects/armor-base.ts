/**
 * ArmorBase — 防具基类
 * 所有防具物品的基类，提供防御力、穿戴位置等属性访问
 */
import { parseRawBonus, type EquipmentBonus } from '@packages/core';
import type { LivingBase } from './living-base';
import { ItemBase, type ItemActionDefinition } from './item-base';

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

  /** 防具动作定义 */
  override getActionDefinitions(owner?: LivingBase): ItemActionDefinition[] {
    return [{ label: '装备', command: `wear ${this.getName()}` }, ...super.getActionDefinitions(owner)];
  }
}
