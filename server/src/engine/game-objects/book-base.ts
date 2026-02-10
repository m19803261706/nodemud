/**
 * BookBase — 秘籍/书籍基类
 * 所有书籍物品的基类，提供技能名称、等级、阅读需求等属性访问
 */
import type { LivingBase } from './living-base';
import { ItemBase, type ItemActionDefinition } from './item-base';
import type { IUsableItem, UseOption, UseResult } from './usable-item';

export class BookBase extends ItemBase implements IUsableItem {
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

  /** 书籍使用选项（可覆写） */
  getUseOptions(_user?: LivingBase): UseOption[] {
    return [{ key: 'read', label: '研读' }];
  }

  /** 书籍使用逻辑（默认不消耗） */
  use(_user: LivingBase, optionKey = 'read'): UseResult {
    if (optionKey !== 'read') {
      return {
        success: false,
        message: `${this.getName()}没有这种研读方式。`,
      };
    }

    const skillName = this.getSkillName();
    const skillLevel = this.getSkillLevel();
    if (skillName) {
      const suffix = skillLevel > 0 ? `（建议境界 ${skillLevel}）` : '';
      return {
        success: true,
        message: `你仔细研读了${this.getName()}，对${skillName}${suffix}有了新的理解。`,
        consume: false,
        resourceChanged: false,
        data: { optionKey, skillName, skillLevel },
      };
    }

    return {
      success: true,
      message: `你翻阅了${this.getName()}。`,
      consume: false,
      resourceChanged: false,
      data: { optionKey },
    };
  }

  /** 书籍动作定义 */
  override getActionDefinitions(owner?: LivingBase): ItemActionDefinition[] {
    const useActions = this.getUseOptions(owner).map((option) => ({
      label: option.label,
      command: option.key === 'read' ? `use ${this.getName()}` : `use ${this.getName()} ${option.key}`,
    }));
    return [...useActions, ...super.getActionDefinitions(owner)];
  }
}
