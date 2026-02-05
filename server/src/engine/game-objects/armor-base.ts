/**
 * ArmorBase — 防具基类
 * 所有防具物品的基类，提供防御力、穿戴位置等属性访问
 */
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

  /** 获取属性加成 */
  getAttributeBonus(): Record<string, number> {
    return this.get<Record<string, number>>('attribute_bonus') ?? {};
  }
}
