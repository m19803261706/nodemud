/**
 * PracticeManager -- 练功管理器
 *
 * 管理玩家的三种修炼模式：
 * - practice（练习）：单次修炼，立即扣资源并提升经验
 * - dazuo（打坐）：持续修炼，每 PRACTICE_TICK_MS 执行一次 tick（weakMode）
 * - jingzuo（静坐）：持续修炼，每 PRACTICE_TICK_MS 执行一次 tick（正常模式）
 *
 * 对标: LPC skill/practice.c / 炎黄 PRACTICE_D
 */
import { Injectable, Logger } from '@nestjs/common';
import {
  MessageFactory,
  PracticeMode,
  SKILL_CONSTANTS,
  type PracticeUpdateData,
} from '@packages/core';
import type { SkillRegistry } from './skill-registry';
import type { SkillBase } from './skill-base';
import type { MartialSkillBase } from './martial/martial-skill-base';
import type { InternalSkillBase } from './internal/internal-skill-base';
import type { PlayerBase } from '../game-objects/player-base';
import type { SkillManager } from './skill-manager';
import type { ResourceCost } from './types';

// ========== 内部数据结构 ==========

/** 练功会话 */
interface PracticeSession {
  /** 玩家 ID */
  playerId: string;
  /** 修炼技能 ID */
  skillId: string;
  /** 修炼模式 */
  mode: PracticeMode;
  /** 开始时间戳 */
  startedAt: number;
  /** 已执行 tick 次数 */
  tickCount: number;
  /** 定时器引用（dazuo/jingzuo 使用） */
  tickCallback?: ReturnType<typeof setInterval>;
}

@Injectable()
export class PracticeManager {
  private readonly logger = new Logger(PracticeManager.name);

  /** 活跃的练功会话 Map<playerId, PracticeSession> */
  private activeSessions: Map<string, PracticeSession> = new Map();

  /** 技能注册表引用（由 EngineModule 注入） */
  private skillRegistry!: SkillRegistry;

  /**
   * 设置技能注册表引用
   * 在 EngineModule 初始化时调用
   */
  setSkillRegistry(registry: SkillRegistry): void {
    this.skillRegistry = registry;
  }

  // ================================================================
  //  公开 API
  // ================================================================

  /**
   * 开始修炼
   * @param player 玩家对象
   * @param skillId 技能 ID
   * @param mode 修炼模式
   * @returns true 表示成功，字符串表示失败原因
   */
  startPractice(player: PlayerBase, skillId: string, mode: PracticeMode): true | string {
    // 1. 校验是否在战斗中
    if (player.isInCombat()) {
      return '你正在战斗中，无法修炼。';
    }

    // 2. 校验是否已在修炼中
    if (this.isInPractice(player)) {
      return '你已经在修炼中了，请先停止当前修炼。';
    }

    // 3. 校验技能是否存在于注册表
    const skillDef = this.skillRegistry.get(skillId);
    if (!skillDef) {
      return '未知的技能。';
    }

    // 4. 校验玩家是否已学会该技能（通过 skillManager）
    const skillData = this.getSkillManager(player)?.getAllSkills().find((s) => s.skillId === skillId);
    if (!skillData) {
      return '你还没有学会这个技能。';
    }

    // 5. 获取修炼消耗
    const cost = this.getPracticeCost(skillDef, player);
    if (!cost) {
      return '该技能不支持修炼。';
    }

    // 6. 检查资源是否足够
    const currentResource = player.get<number>(cost.resource) ?? 0;
    if (currentResource < cost.amount) {
      return `${this.getResourceName(cost.resource)}不足，无法修炼。`;
    }

    // 7. 根据模式执行不同逻辑
    if (mode === PracticeMode.PRACTICE) {
      // 单次修炼：立即扣资源 + 提升经验
      return this.executeSinglePractice(player, skillId, skillDef, cost);
    }

    // 持续修炼：创建会话 + 注册定时器
    return this.startContinuousPractice(player, skillId, mode, skillDef, cost);
  }

  /**
   * 停止修炼
   * @param player 玩家对象
   */
  stopPractice(player: PlayerBase): void {
    const session = this.activeSessions.get(player.id);
    if (!session) return;

    // 清除定时器
    if (session.tickCallback) {
      clearInterval(session.tickCallback);
    }

    // 从活跃会话移除
    this.activeSessions.delete(player.id);

    // 获取技能信息用于推送
    const skillDef = this.skillRegistry.get(session.skillId);
    const skillData = this.getSkillManager(player)?.getAllSkills().find((s) => s.skillId === session.skillId);

    // 推送最终 practiceUpdate（stopped=true）
    this.sendPracticeUpdate(player, {
      skillId: session.skillId,
      skillName: skillDef?.skillName ?? session.skillId,
      mode: session.mode,
      currentLevel: skillData?.level ?? 0,
      learned: skillData?.learned ?? 0,
      learnedMax: Math.pow((skillData?.level ?? 0) + 1, 2),
      levelUp: false,
      message: '你停止了修炼。',
      resourceCost: null,
      stopped: true,
    });

    this.logger.debug(
      `玩家 ${player.getName()} 停止修炼 ${skillDef?.skillName ?? session.skillId}` +
        `（共 ${session.tickCount} tick）`,
    );
  }

  /**
   * 检查玩家是否在修炼中
   * @param player 玩家对象
   */
  isInPractice(player: PlayerBase): boolean {
    return this.activeSessions.has(player.id);
  }

  /**
   * 练功 tick 回调（每 PRACTICE_TICK_MS 执行一次）
   * @param player 玩家对象
   */
  onPracticeTick(player: PlayerBase): void {
    const session = this.activeSessions.get(player.id);
    if (!session) return;

    const skillDef = this.skillRegistry.get(session.skillId);
    if (!skillDef) {
      this.stopPractice(player);
      return;
    }

    // 获取修炼消耗
    const cost = this.getPracticeCost(skillDef, player);
    if (!cost) {
      this.stopPractice(player);
      return;
    }

    // 检查资源是否足够
    const currentResource = player.get<number>(cost.resource) ?? 0;
    if (currentResource < cost.amount) {
      // 资源不足，自动停止
      this.autoStopPractice(player, session, skillDef, '资源不足');
      return;
    }

    // 扣除资源
    player.set(cost.resource, currentResource - cost.amount);

    // 提升技能经验
    // dazuo 模式使用 weakMode（效率低但消耗少）
    const weakMode = session.mode === PracticeMode.DAZUO;
    const didLevelUp = this.getSkillManager(player)?.improveSkill(session.skillId, 1, weakMode) ?? false;

    // tickCount++
    session.tickCount++;

    // 获取最新技能数据
    const skillData = this.getSkillManager(player)?.getAllSkills().find((s) => s.skillId === session.skillId);
    const currentLevel = skillData?.level ?? 0;
    const learned = skillData?.learned ?? 0;
    const learnedMax = Math.pow(currentLevel + 1, 2);

    // 构建修炼消息
    const modeText = session.mode === PracticeMode.DAZUO ? '打坐' : '静坐';
    let message: string;
    if (didLevelUp) {
      message = `你${modeText}修炼「${skillDef.skillName}」，技能提升到了 ${currentLevel} 级！`;
    } else {
      message = `你${modeText}修炼「${skillDef.skillName}」，经验增加了一些。`;
    }

    // 推送 practiceUpdate
    const newResource = player.get<number>(cost.resource) ?? 0;
    this.sendPracticeUpdate(player, {
      skillId: session.skillId,
      skillName: skillDef.skillName,
      mode: session.mode,
      currentLevel,
      learned,
      learnedMax,
      levelUp: didLevelUp,
      message,
      resourceCost: {
        resource: cost.resource,
        amount: cost.amount,
        current: newResource,
      },
      stopped: false,
    });

    // 检查扣除后资源是否还够下一次
    if (newResource < cost.amount) {
      this.autoStopPractice(player, session, skillDef, '资源不足');
    }
  }

  // ================================================================
  //  内部方法
  // ================================================================

  /**
   * 执行单次修炼（practice 模式）
   */
  private executeSinglePractice(
    player: PlayerBase,
    skillId: string,
    skillDef: SkillBase,
    cost: ResourceCost,
  ): true | string {
    // 扣除资源
    const currentResource = player.get<number>(cost.resource) ?? 0;
    player.set(cost.resource, currentResource - cost.amount);

    // 提升技能经验（practice 模式使用正常模式）
    const didLevelUp = this.getSkillManager(player)?.improveSkill(skillId, 1) ?? false;

    // 获取最新技能数据
    const skillData = this.getSkillManager(player)?.getAllSkills().find((s) => s.skillId === skillId);
    const currentLevel = skillData?.level ?? 0;
    const learned = skillData?.learned ?? 0;
    const learnedMax = Math.pow(currentLevel + 1, 2);

    // 构建消息
    let message: string;
    if (didLevelUp) {
      message = `你练习「${skillDef.skillName}」，技能提升到了 ${currentLevel} 级！`;
    } else {
      message = `你练习「${skillDef.skillName}」，经验增加了一些。`;
    }

    // 推送 practiceUpdate
    const newResource = player.get<number>(cost.resource) ?? 0;
    this.sendPracticeUpdate(player, {
      skillId,
      skillName: skillDef.skillName,
      mode: PracticeMode.PRACTICE,
      currentLevel,
      learned,
      learnedMax,
      levelUp: didLevelUp,
      message,
      resourceCost: {
        resource: cost.resource,
        amount: cost.amount,
        current: newResource,
      },
      stopped: true, // practice 模式是单次的，执行后即停止
    });

    this.logger.debug(
      `玩家 ${player.getName()} 单次练习 ${skillDef.skillName}` +
        `（升级: ${didLevelUp}）`,
    );

    return true;
  }

  /**
   * 开始持续修炼（dazuo/jingzuo 模式）
   */
  private startContinuousPractice(
    player: PlayerBase,
    skillId: string,
    mode: PracticeMode,
    skillDef: SkillBase,
    cost: ResourceCost,
  ): true | string {
    // 创建会话
    const session: PracticeSession = {
      playerId: player.id,
      skillId,
      mode,
      startedAt: Date.now(),
      tickCount: 0,
    };

    // 注册定时器
    session.tickCallback = setInterval(() => {
      this.onPracticeTick(player);
    }, SKILL_CONSTANTS.PRACTICE_TICK_MS);

    // 存入活跃会话
    this.activeSessions.set(player.id, session);

    // 获取技能数据用于首次推送
    const skillData = this.getSkillManager(player)?.getAllSkills().find((s) => s.skillId === skillId);
    const currentLevel = skillData?.level ?? 0;
    const learned = skillData?.learned ?? 0;
    const learnedMax = Math.pow(currentLevel + 1, 2);

    const modeText = mode === PracticeMode.DAZUO ? '打坐' : '静坐';

    // 推送开始修炼消息
    this.sendPracticeUpdate(player, {
      skillId,
      skillName: skillDef.skillName,
      mode,
      currentLevel,
      learned,
      learnedMax,
      levelUp: false,
      message: `你开始${modeText}修炼「${skillDef.skillName}」...`,
      resourceCost: {
        resource: cost.resource,
        amount: cost.amount,
        current: player.get<number>(cost.resource) ?? 0,
      },
      stopped: false,
    });

    this.logger.debug(
      `玩家 ${player.getName()} 开始${modeText}修炼 ${skillDef.skillName}`,
    );

    return true;
  }

  /**
   * 资源耗尽自动停止修炼
   */
  private autoStopPractice(
    player: PlayerBase,
    session: PracticeSession,
    skillDef: SkillBase,
    reason: string,
  ): void {
    // 清除定时器
    if (session.tickCallback) {
      clearInterval(session.tickCallback);
    }

    // 从活跃会话移除
    this.activeSessions.delete(player.id);

    // 获取最新技能数据
    const skillData = this.getSkillManager(player)?.getAllSkills().find((s) => s.skillId === session.skillId);
    const currentLevel = skillData?.level ?? 0;
    const learned = skillData?.learned ?? 0;
    const learnedMax = Math.pow(currentLevel + 1, 2);

    // 推送停止消息
    this.sendPracticeUpdate(player, {
      skillId: session.skillId,
      skillName: skillDef.skillName,
      mode: session.mode,
      currentLevel,
      learned,
      learnedMax,
      levelUp: false,
      message: `${reason}，修炼自动停止。（共修炼 ${session.tickCount} 次）`,
      resourceCost: null,
      stopped: true,
    });

    this.logger.debug(
      `玩家 ${player.getName()} 修炼 ${skillDef.skillName} 自动停止` +
        `（原因: ${reason}，共 ${session.tickCount} tick）`,
    );
  }

  /**
   * 获取技能的修炼消耗
   * 从技能定义的 getPracticeCost 方法获取
   */
  private getPracticeCost(skillDef: SkillBase, player: PlayerBase): ResourceCost | null {
    // 检查是否为武学技能（具有 getPracticeCost 方法）
    if ('getPracticeCost' in skillDef && typeof (skillDef as any).getPracticeCost === 'function') {
      return (skillDef as MartialSkillBase | InternalSkillBase).getPracticeCost(player);
    }
    return null;
  }

  /**
   * 推送 practiceUpdate 消息到客户端
   */
  private sendPracticeUpdate(player: PlayerBase, data: PracticeUpdateData): void {
    const msg = MessageFactory.create('practiceUpdate', data);
    if (msg) {
      player.sendToClient(MessageFactory.serialize(msg));
    }
  }

  /**
   * 获取玩家的技能管理器
   * skillManager 将在后续集成任务中挂载到 PlayerBase
   * 此处通过动态属性访问，兼容尚未挂载的情况
   */
  private getSkillManager(player: PlayerBase): SkillManager | undefined {
    return (player as any).skillManager as SkillManager | undefined;
  }

  /**
   * 获取资源的中文名称
   */
  private getResourceName(resource: string): string {
    switch (resource) {
      case 'mp':
        return '内力';
      case 'energy':
        return '精力';
      case 'hp':
        return '气血';
      default:
        return resource;
    }
  }
}
