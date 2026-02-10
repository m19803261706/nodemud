/**
 * SkillRegistry -- 技能注册表
 *
 * NestJS @Injectable 全局单例，管理所有已注册的技能定义。
 * 提供按 skillId 查找、按槽位类型过滤、获取全部技能等功能。
 *
 * 使用方式：
 *   1. 在 EngineModule 中注入 SkillRegistry
 *   2. 各武学模块在初始化时调用 register() 注册具体技能
 *   3. 运行时通过 get() / getBySlotType() 查询技能定义
 */
import { Injectable, Logger } from '@nestjs/common';
import type { SkillSlotType } from '@packages/core';
import type { SkillBase } from './skill-base';

@Injectable()
export class SkillRegistry {
  private readonly logger = new Logger(SkillRegistry.name);

  /** 技能注册表 Map<skillId, SkillBase> */
  private readonly skills: Map<string, SkillBase> = new Map();

  /**
   * 注册一个技能到注册表
   * 如果 skillId 已存在会覆盖并输出警告日志
   * @param skill 技能实例
   */
  register(skill: SkillBase): void {
    if (this.skills.has(skill.skillId)) {
      this.logger.warn(
        `技能 ${skill.skillId}(${skill.skillName}) 已存在，将被覆盖`,
      );
    }
    this.skills.set(skill.skillId, skill);
    this.logger.debug(`注册技能: ${skill.skillId}(${skill.skillName})`);
  }

  /**
   * 根据 skillId 获取技能定义
   * @param skillId 技能唯一标识
   * @returns 技能实例，不存在则返回 undefined
   */
  get(skillId: string): SkillBase | undefined {
    return this.skills.get(skillId);
  }

  /**
   * 获取指定槽位类型的所有技能
   * @param slotType 技能槽位类型
   * @returns 该槽位下的所有已注册技能
   */
  getBySlotType(slotType: SkillSlotType): SkillBase[] {
    const result: SkillBase[] = [];
    for (const skill of this.skills.values()) {
      if (skill.skillType === slotType) {
        result.push(skill);
      }
    }
    return result;
  }

  /**
   * 获取所有已注册的技能
   * @returns 全部技能实例数组
   */
  getAll(): SkillBase[] {
    return [...this.skills.values()];
  }

  /**
   * 获取已注册技能总数
   */
  getCount(): number {
    return this.skills.size;
  }
}
