/**
 * BookBase — 秘籍/书籍基类
 *
 * 支持三种书籍类型：
 * - SKILL: 技能秘籍，可通过 study 命令研读学习技能
 * - TEXT: 文本读物，可通过 read 命令阅读内容
 * - RECIPE: 配方典籍，可通过 read 命令学习配方
 *
 * 对标: 炎黄 MUD study.c / book.c
 */
import type { LivingBase } from './living-base';
import { ItemBase, type ItemActionDefinition } from './item-base';
import type { IUsableItem, UseOption, UseResult } from './usable-item';
import { BookType } from '@packages/core';

export class BookBase extends ItemBase implements IUsableItem {
  static virtual = false;

  // ========== 基础属性访问 ==========

  /** 获取书籍类型 */
  getBookType(): BookType {
    return this.get<BookType>('book_type') ?? BookType.TEXT;
  }

  /** 获取技能名称（显示用） */
  getSkillName(): string {
    return this.get<string>('skill/name') ?? this.get<string>('skill_name') ?? '';
  }

  /** 获取技能注册表 ID */
  getSkillId(): string {
    return this.get<string>('skill/skill_id') ?? '';
  }

  /** 获取研读难度 */
  getDifficulty(): number {
    return this.get<number>('skill/difficulty') ?? 10;
  }

  /** 获取基础精力消耗/次 */
  getBaseJingCost(): number {
    return this.get<number>('skill/jing_cost') ?? 5;
  }

  /** 获取最低可学等级 */
  getMinLevel(): number {
    return this.get<number>('skill/min_level') ?? 0;
  }

  /** 获取最高可学等级 */
  getMaxLevel(): number {
    return this.get<number>('skill/max_level') ?? 20;
  }

  /** 获取所需最低角色等级 */
  getExpRequired(): number {
    return this.get<number>('skill/exp_required') ?? 0;
  }

  /** 获取前置技能需求 {skillId: minLevel} */
  getNeedSkills(): Record<string, number> {
    return this.get<Record<string, number>>('skill/need') ?? {};
  }

  /** 获取阅读需求（兼容旧属性） */
  getReadRequirement(): Record<string, number> {
    return this.get<Record<string, number>>('read_requirement') ?? {};
  }

  // ========== 文本书籍属性 ==========

  /** 获取正文内容 */
  getContent(): string {
    return this.get<string>('content') ?? '';
  }

  /** 获取分页内容 */
  getPages(): string[] {
    return this.get<string[]>('pages') ?? [];
  }

  // ========== 配方书属性 ==========

  /** 获取配方列表 */
  getRecipes(): Record<string, { blueprintId: string; skillLevel: number; jingCost: number }> {
    return (
      this.get<Record<string, { blueprintId: string; skillLevel: number; jingCost: number }>>(
        'recipes',
      ) ?? {}
    );
  }

  // ========== 计算方法 ==========

  /**
   * 计算研读精力消耗
   * 公式: max(10, floor((jing_cost * 20 + difficulty - perception) / 20))
   */
  calculateEnergyCost(perception: number): number {
    const baseCost = this.getBaseJingCost();
    const difficulty = this.getDifficulty();
    return Math.max(10, Math.floor((baseCost * 20 + difficulty - perception) / 20));
  }

  // ========== IUsableItem 协议 ==========

  /** 根据 book_type 返回不同使用选项 */
  getUseOptions(_user?: LivingBase): UseOption[] {
    const bookType = this.getBookType();
    switch (bookType) {
      case BookType.SKILL:
        return [
          { key: 'read', label: '查阅' },
          { key: 'study', label: '研读' },
        ];
      case BookType.RECIPE:
        return [{ key: 'read', label: '查阅配方' }];
      case BookType.TEXT:
      default:
        return [{ key: 'read', label: '阅读' }];
    }
  }

  /** 书籍使用逻辑（轻量提示，真正学习走 study/read 命令） */
  use(_user: LivingBase, optionKey = 'read'): UseResult {
    const bookType = this.getBookType();
    const name = this.getName();

    if (optionKey === 'study') {
      if (bookType !== BookType.SKILL) {
        return { success: false, message: `${name}不是一本技能秘籍。` };
      }
      return {
        success: true,
        message: `请使用「study ${name}」命令来研读此秘籍。`,
        consume: false,
        resourceChanged: false,
        data: { optionKey, hint: 'study' },
      };
    }

    if (optionKey === 'read') {
      switch (bookType) {
        case BookType.SKILL: {
          const skillName = this.getSkillName();
          return {
            success: true,
            message: `${name}记载着「${skillName}」的修炼法门，可用「study ${name}」命令研读。`,
            consume: false,
            resourceChanged: false,
            data: { optionKey, skillName },
          };
        }
        case BookType.RECIPE:
          return {
            success: true,
            message: `请使用「read ${name}」命令查阅配方。`,
            consume: false,
            resourceChanged: false,
            data: { optionKey, hint: 'read' },
          };
        case BookType.TEXT:
        default:
          return {
            success: true,
            message: `请使用「read ${name}」命令阅读。`,
            consume: false,
            resourceChanged: false,
            data: { optionKey, hint: 'read' },
          };
      }
    }

    return {
      success: false,
      message: `${name}没有这种使用方式。`,
    };
  }

  /** 书籍动作定义 */
  override getActionDefinitions(owner?: LivingBase): ItemActionDefinition[] {
    const bookType = this.getBookType();
    const name = this.getName();
    const actions: ItemActionDefinition[] = [];

    switch (bookType) {
      case BookType.SKILL:
        actions.push({ label: '研读', command: `study ${name}` });
        actions.push({ label: '查阅', command: `read ${name}` });
        break;
      case BookType.RECIPE:
        actions.push({ label: '查阅配方', command: `read ${name}` });
        break;
      case BookType.TEXT:
      default:
        actions.push({ label: '阅读', command: `read ${name}` });
        break;
    }

    return [...actions, ...super.getActionDefinitions(owner)];
  }
}
