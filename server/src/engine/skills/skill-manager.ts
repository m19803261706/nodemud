/**
 * SkillManager -- 技能管理器
 *
 * 挂载于每个 PlayerBase 实例，负责技能生命周期管理：
 * - 学习、提升、映射、查询
 * - 死亡惩罚与等级回退
 * - 属性加成聚合
 * - 战斗行动收集
 * - 持久化存取
 *
 * 对标: LPC skill.c / 炎黄 SKILL_D
 */
import { Logger } from '@nestjs/common';
import {
  MessageFactory,
  SkillSlotType,
  SkillCategory,
  SkillUpdateReason,
  SKILL_CONSTANTS,
  SKILL_SLOT_NAMES,
  type SkillLearnSource,
  type PlayerSkillInfo,
  type SkillBonusSummary,
  type CombatActionOption,
  type ResourceCostInfo,
} from '@packages/core';
import type { PlayerBase } from '../game-objects/player-base';
import type { SkillService } from '../../skill/skill.service';
import type { SkillRegistry } from './skill-registry';
import type { SkillBase } from './skill-base';
import type { MartialSkillBase } from './martial/martial-skill-base';
import type { InternalSkillBase } from './internal/internal-skill-base';

// ========== 内部数据结构 ==========

/**
 * 玩家技能内存数据
 * 对应 PlayerSkill 实体，但在运行时以轻量对象驻留内存
 */
export interface PlayerSkillData {
  /** 数据库主键（用于持久化更新） */
  dbId: string | null;
  /** 技能标识 */
  skillId: string;
  /** 槽位类型 */
  skillType: SkillSlotType;
  /** 当前等级 */
  level: number;
  /** 当前已积累修炼经验 */
  learned: number;
  /** 是否已映射到槽位 */
  isMapped: boolean;
  /** 映射的槽位类型 */
  mappedSlot: SkillSlotType | null;
  /** 是否为当前激活内功 */
  isActiveForce: boolean;
  /** 是否锁定 */
  isLocked: boolean;
  /** 脏标记（标记需要持久化） */
  dirty: boolean;
}

export class SkillManager {
  private readonly logger = new Logger(SkillManager.name);

  /** 玩家所有技能 Map<skillId, PlayerSkillData> */
  private skills: Map<string, PlayerSkillData> = new Map();

  /** 技能映射 Map<槽位类型, 技能ID> */
  private skillMap: Map<SkillSlotType, string> = new Map();

  /** 当前激活内功 ID */
  private activeForce: string | null = null;

  constructor(
    private readonly player: PlayerBase,
    private readonly skillService: SkillService,
    private readonly skillRegistry: SkillRegistry,
  ) {}

  // ================================================================
  //  数据库加载
  // ================================================================

  /**
   * 从数据库加载角色的全部技能数据
   * @param characterId 角色ID
   */
  async loadFromDatabase(characterId: string): Promise<void> {
    const records = await this.skillService.findByCharacter(characterId);

    this.skills.clear();
    this.skillMap.clear();
    this.activeForce = null;

    for (const record of records) {
      const data: PlayerSkillData = {
        dbId: record.id,
        skillId: record.skillId,
        skillType: record.skillType as SkillSlotType,
        level: record.level,
        learned: record.learned,
        isMapped: record.isMapped,
        mappedSlot: record.mappedSlot as SkillSlotType | null,
        isActiveForce: record.isActiveForce,
        isLocked: record.isLocked,
        dirty: false,
      };

      this.skills.set(record.skillId, data);

      // 恢复槽位映射
      if (data.isMapped && data.mappedSlot) {
        this.skillMap.set(data.mappedSlot, data.skillId);
      }

      // 恢复激活内功
      if (data.isActiveForce) {
        this.activeForce = data.skillId;
      }
    }

    this.logger.debug(`玩家 ${this.player.getName()} 加载 ${this.skills.size} 个技能`);
  }

  // ================================================================
  //  学习技能
  // ================================================================

  /**
   * 学习新技能
   * @param skillId 技能ID
   * @param source 学习来源
   * @returns true 表示成功，字符串表示失败原因
   */
  learnSkill(skillId: string, source: SkillLearnSource): true | string {
    // 已学习检查
    if (this.skills.has(skillId)) {
      return '你已经学会了这个技能。';
    }

    // 从注册表获取技能定义
    const skillDef = this.skillRegistry.get(skillId);
    if (!skillDef) {
      return '未知的技能。';
    }

    // 学习条件校验
    const canLearn = skillDef.validLearn(this.player);
    if (canLearn !== true) {
      return canLearn;
    }

    // 冲突检查
    const conflicts = skillDef.getConflicts();
    for (const conflictId of conflicts) {
      if (this.skills.has(conflictId)) {
        const conflictDef = this.skillRegistry.get(conflictId);
        const conflictName = conflictDef?.skillName ?? conflictId;
        return `此技能与「${conflictName}」冲突，无法同时学习。`;
      }
    }

    // 创建技能数据
    const data: PlayerSkillData = {
      dbId: null,
      skillId,
      skillType: skillDef.skillType,
      level: 0,
      learned: 0,
      isMapped: false,
      mappedSlot: null,
      isActiveForce: false,
      isLocked: false,
      dirty: true,
    };

    this.skills.set(skillId, data);

    // 异步持久化（不阻塞）
    this.persistNewSkill(data);

    // 推送 skillLearn 消息
    const msg = MessageFactory.create('skillLearn', {
      skillId,
      skillName: skillDef.skillName,
      skillType: skillDef.skillType,
      category: skillDef.category,
      source,
      message: `你学会了「${skillDef.skillName}」！`,
    });
    if (msg) {
      this.player.sendToClient(MessageFactory.serialize(msg));
    }

    this.logger.debug(`玩家 ${this.player.getName()} 学习技能: ${skillDef.skillName}(${skillId})`);

    return true;
  }

  /**
   * 异步持久化新学习的技能
   */
  private async persistNewSkill(data: PlayerSkillData): Promise<void> {
    try {
      const characterId = this.player.get<string>('characterId');
      if (!characterId) return;

      const record = await this.skillService.create({
        character: { id: characterId } as any,
        skillId: data.skillId,
        skillType: data.skillType,
        level: data.level,
        learned: data.learned,
        isMapped: data.isMapped,
        mappedSlot: data.mappedSlot,
        isActiveForce: data.isActiveForce,
        isLocked: data.isLocked,
      });

      // 回填数据库主键
      data.dbId = record.id;
      data.dirty = false;
    } catch (err) {
      this.logger.error(`持久化技能 ${data.skillId} 失败: ${err}`);
    }
  }

  // ================================================================
  //  技能提升
  // ================================================================

  /**
   * 提升技能经验（方块沉淀公式）
   *
   * 升级条件: learned >= (level + 1)^2
   * 悟性加成: effectiveAmount = amount * (1 + cognizeLevel / COGNIZE_FACTOR)
   * 属性影响: attrBonus = 1 + attrValue * 100 / (currentLevel + ATTR_FACTOR)
   * finalAmount = effectiveAmount * attrBonus
   *
   * @param skillId 技能ID
   * @param amount 基础经验量
   * @param weakMode 弱模式（不应用悟性加成）
   * @returns 是否发生了升级
   */
  improveSkill(skillId: string, amount: number, weakMode?: boolean): boolean {
    const data = this.skills.get(skillId);
    if (!data) return false;

    const skillDef = this.skillRegistry.get(skillId);
    if (!skillDef) return false;

    // 检查技能是否可以提升
    if (!skillDef.canImprove(this.player, data.level)) {
      return false;
    }

    // 检查等级上限
    const maxLevel = skillDef.validLearnLevel();
    if (data.level >= maxLevel) {
      return false;
    }

    // 悟性加成
    let effectiveAmount = amount;
    if (!weakMode) {
      const cognizeLevel = this.getSkillLevel('cognize', true);
      effectiveAmount = amount * (1 + cognizeLevel / SKILL_CONSTANTS.COGNIZE_FACTOR);
    }

    // 属性影响 -- 使用技能对应的主属性
    const attrValue = this.getRelevantAttr(skillDef);
    const attrBonus = 1 + (attrValue * 100) / (data.level + SKILL_CONSTANTS.ATTR_FACTOR);
    const finalAmount = effectiveAmount * attrBonus;

    // 增加修炼经验
    data.learned += finalAmount;
    data.dirty = true;

    // 检查升级: learned >= (level + 1)^2
    // 升级时清零 learned（方块沉淀公式）
    const oldLevel = data.level;
    let didLevelUp = false;

    while (data.level < maxLevel) {
      const threshold = Math.pow(data.level + 1, 2);
      if (data.learned < threshold) break;

      data.learned = 0; // 升级后清零修炼经验
      data.level++;
      didLevelUp = true;

      // 触发技能升级回调
      skillDef.onSkillImproved(this.player, data.level);
    }

    // 推送 skillUpdate 消息
    if (didLevelUp) {
      this.sendSkillUpdate(
        skillId,
        {
          level: data.level,
          learned: data.learned,
          learnedMax: Math.pow(data.level + 1, 2),
        },
        SkillUpdateReason.LEVEL_UP,
      );

      this.logger.debug(
        `玩家 ${this.player.getName()} 技能 ${skillDef.skillName} 升级: ${oldLevel} -> ${data.level}`,
      );
    }

    return didLevelUp;
  }

  /**
   * 获取技能对应的主属性值
   * 根据技能分类确定关联属性
   */
  private getRelevantAttr(skillDef: SkillBase): number {
    // 武学类技能关联 strength
    if (skillDef.category === SkillCategory.MARTIAL) {
      return this.player.get<number>('strength') ?? 0;
    }
    // 内功关联 spirit
    if (skillDef.category === SkillCategory.INTERNAL) {
      return this.player.get<number>('spirit') ?? 0;
    }
    // 辅技关联 wisdom
    if (skillDef.category === SkillCategory.SUPPORT) {
      return this.player.get<number>('wisdom') ?? 0;
    }
    // 悟性关联 perception
    return this.player.get<number>('perception') ?? 0;
  }

  // ================================================================
  //  技能映射（装配）
  // ================================================================

  /**
   * 映射技能到槽位
   * @param slotType 目标槽位
   * @param skillId 技能ID（null 表示取消映射）
   * @returns true 表示成功，字符串表示失败原因
   */
  mapSkill(slotType: SkillSlotType, skillId: string | null): true | string {
    // 取消映射
    if (skillId === null) {
      return this.unmapSlot(slotType);
    }

    // 获取技能数据
    const data = this.skills.get(skillId);
    if (!data) {
      return '你还没有学会这个技能。';
    }

    // 获取技能定义
    const skillDef = this.skillRegistry.get(skillId);
    if (!skillDef) {
      return '技能定义不存在。';
    }

    // 校验 validEnable（检查技能是否可以装配到指定槽位）
    if ('validEnable' in skillDef && typeof (skillDef as any).validEnable === 'function') {
      const canEnable = (skillDef as MartialSkillBase).validEnable(slotType);
      if (!canEnable) {
        const slotName = SKILL_SLOT_NAMES[slotType] ?? slotType;
        return `「${skillDef.skillName}」不能装配到${slotName}槽位。`;
      }
    }

    // 同槽位替换：先取消旧映射
    const oldSkillId = this.skillMap.get(slotType);
    if (oldSkillId) {
      this.unmapSlot(slotType);
    }

    // 如果技能已映射到其他槽位，先取消
    if (data.isMapped && data.mappedSlot && data.mappedSlot !== slotType) {
      this.unmapSlot(data.mappedSlot);
    }

    // 执行映射
    data.isMapped = true;
    data.mappedSlot = slotType;
    data.dirty = true;
    this.skillMap.set(slotType, skillId);

    // 内功映射到 FORCE 槽位时，更新 activeForce
    if (slotType === SkillSlotType.FORCE) {
      // 取消旧内功的 isActiveForce
      if (this.activeForce && this.activeForce !== skillId) {
        const oldForceData = this.skills.get(this.activeForce);
        if (oldForceData) {
          oldForceData.isActiveForce = false;
          oldForceData.dirty = true;
        }
        // W-2: 切换内功时清零内力（防止新旧内功上限不同导致溢出）
        this.player.set('mp', 0);
      }
      data.isActiveForce = true;
      this.activeForce = skillId;

      this.sendSkillUpdate(
        skillId,
        {
          isMapped: true,
          mappedSlot: slotType,
          isActiveForce: true,
        },
        SkillUpdateReason.FORCE_ACTIVATED,
      );
    } else {
      this.sendSkillUpdate(
        skillId,
        {
          isMapped: true,
          mappedSlot: slotType,
        },
        SkillUpdateReason.MAPPED,
      );
    }

    this.logger.debug(
      `玩家 ${this.player.getName()} 映射技能: ${skillDef.skillName} -> ${slotType}`,
    );

    return true;
  }

  /**
   * 取消指定槽位的技能映射
   */
  private unmapSlot(slotType: SkillSlotType): true | string {
    const skillId = this.skillMap.get(slotType);
    if (!skillId) {
      const slotName = SKILL_SLOT_NAMES[slotType] ?? slotType;
      return `${slotName}槽位当前没有装配技能。`;
    }

    const data = this.skills.get(skillId);
    if (data) {
      data.isMapped = false;
      data.mappedSlot = null;
      data.dirty = true;

      // 如果取消的是激活内功，清除 activeForce
      if (slotType === SkillSlotType.FORCE && data.isActiveForce) {
        data.isActiveForce = false;
        this.activeForce = null;
      }
    }

    this.skillMap.delete(slotType);

    this.sendSkillUpdate(
      skillId,
      {
        isMapped: false,
        mappedSlot: null,
      },
      SkillUpdateReason.UNMAPPED,
    );

    return true;
  }

  // ================================================================
  //  死亡惩罚
  // ================================================================

  /**
   * 应用死亡惩罚
   * 1. 遍历所有技能调用 onDeathPenalty
   * 2. 保护 learned 值
   * 3. 清除所有映射
   * 4. 保持 activeForce 不变
   */
  applyDeathPenalty(): void {
    const changedSkills: string[] = [];

    for (const [skillId, data] of this.skills) {
      const skillDef = this.skillRegistry.get(skillId);
      if (!skillDef) continue;

      const oldLevel = data.level;

      // learned 保护机制: 若 learned > (level+1)^2 / 2 则不扣 level，只清 learned
      const protectionThreshold = Math.pow(oldLevel + 1, 2) / 2;
      if (data.learned > protectionThreshold) {
        // 保护触发: 不降级，只清零 learned
        data.learned = 0;
        data.dirty = true;
        changedSkills.push(skillId);
      } else {
        // 正常降级
        const newLevel = skillDef.onDeathPenalty(this.player, data.level);
        if (newLevel !== oldLevel) {
          data.level = newLevel;
          data.dirty = true;
          changedSkills.push(skillId);
        }
      }
    }

    // 清除所有映射（但 activeForce 保持）
    for (const [slotType, skillId] of this.skillMap) {
      const data = this.skills.get(skillId);
      if (data) {
        data.isMapped = false;
        data.mappedSlot = null;
        data.dirty = true;

        // 保持 activeForce 标记不变
        // isActiveForce 不清除，仅清除映射状态
      }
    }
    this.skillMap.clear();

    // 推送所有变化的技能更新
    for (const skillId of changedSkills) {
      const data = this.skills.get(skillId);
      if (data) {
        this.sendSkillUpdate(
          skillId,
          {
            level: data.level,
            learned: data.learned,
            learnedMax: Math.pow(data.level + 1, 2),
            isMapped: false,
            mappedSlot: null,
          },
          SkillUpdateReason.DEATH_PENALTY,
        );
      }
    }

    this.logger.debug(`玩家 ${this.player.getName()} 死亡惩罚: ${changedSkills.length} 个技能降级`);
  }

  // ================================================================
  //  技能加成汇总
  // ================================================================

  /**
   * 聚合所有已映射技能的属性加成
   * 包括装配武学的战斗属性和激活内功的资源加成
   */
  getSkillBonusSummary(): SkillBonusSummary {
    const summary: SkillBonusSummary = {
      attack: 0,
      defense: 0,
      dodge: 0,
      parry: 0,
      maxHp: 0,
      maxMp: 0,
      critRate: 0,
      hitRate: 0,
    };

    // 聚合已映射武学技能的属性加成
    for (const [slotType, skillId] of this.skillMap) {
      const data = this.skills.get(skillId);
      if (!data) continue;

      const skillDef = this.skillRegistry.get(skillId);
      if (!skillDef) continue;

      // 内功属性加成
      if (this.isInternalSkill(skillDef)) {
        const internal = skillDef as InternalSkillBase;
        const attrBonus = internal.getAttributeBonus(data.level);

        // 映射属性加成到战斗属性
        if (attrBonus.strength) summary.attack += attrBonus.strength * 2;
        if (attrBonus.vitality) summary.defense += Math.floor(attrBonus.vitality * 1.5);
        if (attrBonus.perception) summary.dodge += attrBonus.perception;
        if (attrBonus.spirit) summary.hitRate += attrBonus.spirit;
      }

      // 轻功加成到闪避
      if (slotType === SkillSlotType.DODGE) {
        summary.dodge += data.level;
      }

      // 招架加成到招架
      if (slotType === SkillSlotType.PARRY) {
        summary.parry += data.level;
      }
    }

    // 激活内功的资源上限加成
    if (this.activeForce) {
      const forceData = this.skills.get(this.activeForce);
      const forceDef = this.skillRegistry.get(this.activeForce);
      if (forceData && forceDef && this.isInternalSkill(forceDef)) {
        const internal = forceDef as InternalSkillBase;
        const resourceBonus = internal.getResourceBonus(forceData.level);
        if (resourceBonus.maxHp) summary.maxHp += resourceBonus.maxHp;
        if (resourceBonus.maxMp) summary.maxMp += resourceBonus.maxMp;
      }
    }

    return summary;
  }

  // ================================================================
  //  战斗行动收集
  // ================================================================

  /**
   * 获取当前可用的战斗行动列表
   * 收集映射的外功招式 + 激活内功的招式
   */
  getAvailableCombatActions(): CombatActionOption[] {
    const actions: CombatActionOption[] = [];
    let index = 0;

    // 收集映射的外功招式
    for (const [slotType, skillId] of this.skillMap) {
      // 跳过内功槽位（单独处理）
      if (slotType === SkillSlotType.FORCE) continue;

      const data = this.skills.get(skillId);
      if (!data) continue;

      const skillDef = this.skillRegistry.get(skillId);
      if (!skillDef) continue;

      if (this.isMartialSkill(skillDef)) {
        const martial = skillDef as MartialSkillBase;
        const available = martial.getAvailableActions(data.level);

        for (const action of available) {
          actions.push({
            index: index++,
            skillId,
            skillName: skillDef.skillName,
            actionName: action.name,
            actionDesc: action.description,
            lvl: action.lvl,
            costs: this.mapResourceCosts(action.costs),
            canUse: this.checkResourceCosts(action.costs),
            isInternal: false,
          });
        }
      }
    }

    // 收集激活内功的招式
    if (this.activeForce) {
      const forceData = this.skills.get(this.activeForce);
      const forceDef = this.skillRegistry.get(this.activeForce);
      if (forceData && forceDef && this.isInternalSkill(forceDef)) {
        const internal = forceDef as InternalSkillBase;
        const forceActions = internal.actions.filter((action) => action.lvl <= forceData.level);

        for (const action of forceActions) {
          actions.push({
            index: index++,
            skillId: this.activeForce,
            skillName: forceDef.skillName,
            actionName: action.name,
            actionDesc: action.description,
            lvl: action.lvl,
            costs: this.mapResourceCosts(action.costs),
            canUse: this.checkResourceCosts(action.costs),
            isInternal: true,
          });
        }
      }
    }

    return actions;
  }

  /**
   * 将 ResourceCost 转换为 ResourceCostInfo（附带当前值）
   */
  private mapResourceCosts(costs: import('./types').ResourceCost[]): ResourceCostInfo[] {
    return costs.map((cost) => ({
      resource: cost.resource,
      amount: cost.amount,
      current: this.player.get<number>(cost.resource) ?? 0,
    }));
  }

  /**
   * 检查是否满足资源消耗条件
   */
  private checkResourceCosts(costs: import('./types').ResourceCost[]): boolean {
    for (const cost of costs) {
      const current = this.player.get<number>(cost.resource) ?? 0;
      if (current < cost.amount) return false;
    }
    return true;
  }

  // ================================================================
  //  持久化
  // ================================================================

  /**
   * 批量保存所有脏数据到数据库
   */
  async saveToDatabase(): Promise<void> {
    const updates: { id: string; data: any }[] = [];

    for (const [, data] of this.skills) {
      if (!data.dirty || !data.dbId) continue;

      updates.push({
        id: data.dbId,
        data: {
          level: data.level,
          learned: data.learned,
          isMapped: data.isMapped,
          mappedSlot: data.mappedSlot,
          isActiveForce: data.isActiveForce,
          isLocked: data.isLocked,
        },
      });

      data.dirty = false;
    }

    if (updates.length > 0) {
      await this.skillService.updateMany(updates);
      this.logger.debug(`玩家 ${this.player.getName()} 保存 ${updates.length} 个技能`);
    }
  }

  // ================================================================
  //  查询方法
  // ================================================================

  /**
   * 获取技能等级
   * @param skillId 技能ID
   * @param raw 是否返回原始等级（不考虑映射加成）
   * @returns 技能等级，未学习返回 0
   */
  getSkillLevel(skillId: string, raw?: boolean): number {
    const data = this.skills.get(skillId);
    if (!data) return 0;
    return data.level;
  }

  /**
   * 获取指定槽位的有效技能等级
   * @param slotType 槽位类型
   * @returns 该槽位映射技能的等级，未映射返回 0
   */
  getEffectiveLevel(slotType: SkillSlotType): number {
    const skillId = this.skillMap.get(slotType);
    if (!skillId) return 0;

    const data = this.skills.get(skillId);
    return data?.level ?? 0;
  }

  /**
   * 获取技能映射表（槽位 -> 技能ID）
   */
  getSkillMap(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [slot, skillId] of this.skillMap) {
      result[slot] = skillId;
    }
    return result;
  }

  /**
   * 获取全部已学习技能
   */
  getAllSkills(): PlayerSkillData[] {
    return [...this.skills.values()];
  }

  /**
   * 获取当前激活的内功ID
   */
  getActiveForce(): string | null {
    return this.activeForce;
  }

  /**
   * 获取指定槽位映射的技能定义
   * @param slotType 槽位类型
   * @returns 技能定义实例，未映射返回 null
   */
  getMappedSkill(slotType: SkillSlotType): SkillBase | null {
    const skillId = this.skillMap.get(slotType);
    if (!skillId) return null;
    return this.skillRegistry.get(skillId) ?? null;
  }

  /**
   * 战斗使用技能 -- 领悟判定
   * 每次战斗中使用技能有概率获得修炼经验
   * 公式: random(COMBAT_INSIGHT_RANGE) < skillLevel
   * 即技能等级越高，领悟概率越大
   */
  onCombatSkillUse(skillId: string): void {
    const data = this.skills.get(skillId);
    if (!data) return;

    // 领悟判定: random(0..COMBAT_INSIGHT_RANGE-1) < 技能等级
    // 等级 >= COMBAT_INSIGHT_RANGE(120) 时必定触发
    const roll = Math.floor(Math.random() * SKILL_CONSTANTS.COMBAT_INSIGHT_RANGE);
    if (roll < data.level) {
      // 战斗领悟获得少量经验（weakMode，不应用悟性加成）
      this.improveSkill(skillId, 1, true);
    }
  }

  // ================================================================
  //  辅助方法
  // ================================================================

  /**
   * 发送 skillUpdate 消息到客户端
   */
  private sendSkillUpdate(
    skillId: string,
    changes: Partial<PlayerSkillInfo>,
    reason: SkillUpdateReason,
  ): void {
    const msg = MessageFactory.create('skillUpdate', {
      skillId,
      changes,
      reason,
    });
    if (msg) {
      this.player.sendToClient(MessageFactory.serialize(msg));
    }
  }

  /**
   * 构建单个技能的 PlayerSkillInfo（用于消息推送）
   */
  buildSkillInfo(skillId: string): PlayerSkillInfo | null {
    const data = this.skills.get(skillId);
    if (!data) return null;

    const skillDef = this.skillRegistry.get(skillId);
    if (!skillDef) return null;

    return {
      skillId: data.skillId,
      skillName: skillDef.skillName,
      skillType: data.skillType,
      category: skillDef.category,
      level: data.level,
      learned: data.learned,
      learnedMax: Math.pow(data.level + 1, 2),
      isMapped: data.isMapped,
      mappedSlot: data.mappedSlot,
      isActiveForce: data.isActiveForce,
      isLocked: data.isLocked,
    };
  }

  /**
   * 构建全部技能列表信息（用于 skillList 消息推送）
   */
  buildSkillListData(): {
    skills: PlayerSkillInfo[];
    skillMap: Record<string, string>;
    activeForce: string | null;
  } {
    const skills: PlayerSkillInfo[] = [];
    for (const [skillId] of this.skills) {
      const info = this.buildSkillInfo(skillId);
      if (info) skills.push(info);
    }

    return {
      skills,
      skillMap: this.getSkillMap(),
      activeForce: this.activeForce,
    };
  }

  /**
   * 检查技能定义是否为武学类（具有 getAvailableActions 方法）
   */
  private isMartialSkill(skillDef: SkillBase): skillDef is MartialSkillBase {
    return (
      'getAvailableActions' in skillDef &&
      typeof (skillDef as any).getAvailableActions === 'function'
    );
  }

  /**
   * 检查技能定义是否为内功类（具有 getAttributeBonus 方法）
   */
  private isInternalSkill(skillDef: SkillBase): skillDef is InternalSkillBase {
    return (
      'getAttributeBonus' in skillDef && typeof (skillDef as any).getAttributeBonus === 'function'
    );
  }
}
