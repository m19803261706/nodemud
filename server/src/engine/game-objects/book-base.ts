/**
 * BookBase — 秘籍/书籍基类
 * 所有书籍物品的基类，提供技能名称、等级、阅读需求等属性访问
 */
import { ItemBase } from './item-base';

export class BookBase extends ItemBase {
  static virtual = false;

  /** 获取技能名称 */
  getSkillName(): string {
    return this.get<string>('skill_name') ?? '';
  }

  /** 获取技能等级 */
  getSkillLevel(): number {
    return this.get<number>('skill_level') ?? 0;
  }

  /** 获取阅读需求 */
  getReadRequirement(): Record<string, number> {
    return this.get<Record<string, number>>('read_requirement') ?? {};
  }
}
