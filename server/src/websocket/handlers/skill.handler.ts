/**
 * 技能消息处理器
 * 处理技能使用、装配、面板、学艺、修炼等全部技能相关 WebSocket 消息
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  MessageFactory,
  SkillLearnSource,
  type SkillUseData,
  type SkillMapRequestData,
  type SkillPanelRequestData,
  type SkillLearnRequestData,
  type PracticeStartData,
  type PracticeEndData,
  type SkillMapResultData,
  type SkillPanelDataResponse,
  type SkillLearnResultData,
  type SkillDetailInfo,
  type ActionDetailInfo,
  type SkillSlotType,
} from '@packages/core';
import { ObjectManager } from '../../engine/object-manager';
import { SkillService } from '../../skill/skill.service';
import { SkillRegistry } from '../../engine/skills/skill-registry';
import { CombatManager } from '../../engine/combat/combat-manager';
import { PracticeManager } from '../../engine/skills/practice-manager';
import type { PlayerBase } from '../../engine/game-objects/player-base';
import type { RoomBase } from '../../engine/game-objects/room-base';
import { NpcBase } from '../../engine/game-objects/npc-base';
import type { Session } from '../types/session';
import type { SkillAction } from '../../engine/skills/types';

@Injectable()
export class SkillHandler {
  private readonly logger = new Logger(SkillHandler.name);

  constructor(
    private readonly objectManager: ObjectManager,
    private readonly skillService: SkillService,
    private readonly skillRegistry: SkillRegistry,
    private readonly combatManager: CombatManager,
    private readonly practiceManager: PracticeManager,
  ) {}

  // ================================================================
  //  1. 战斗中使用技能
  // ================================================================

  /**
   * 处理战斗技能使用
   * 客户端在 combatAwaitAction 阶段选择招式后发送
   */
  async handleSkillUse(session: Session, data: SkillUseData): Promise<void> {
    try {
      const player = this.getPlayerFromSession(session);
      if (!player) return;

      this.combatManager.executeSkillAction(data.combatId, player, data.actionIndex);
    } catch (error) {
      this.logger.error('handleSkillUse 失败:', error);
    }
  }

  // ================================================================
  //  2. 技能装配/卸下
  // ================================================================

  /**
   * 处理技能装配请求
   * 将技能映射到指定槽位，或取消映射
   */
  async handleSkillMapRequest(session: Session, data: SkillMapRequestData): Promise<void> {
    try {
      const player = this.getPlayerFromSession(session);
      if (!player) return;

      const skillManager = player.skillManager;
      if (!skillManager) {
        player.receiveMessage('技能系统尚未初始化。');
        return;
      }

      // 执行映射操作
      const result = skillManager.mapSkill(data.slotType as SkillSlotType, data.skillId);
      const success = result === true;

      // 获取技能名称
      let skillName: string | null = null;
      if (data.skillId) {
        const skillDef = this.skillRegistry.get(data.skillId);
        skillName = skillDef?.skillName ?? null;
      }

      // 构建响应数据
      const responseData: SkillMapResultData = {
        success,
        slotType: data.slotType as SkillSlotType,
        skillId: data.skillId,
        skillName,
        message: success ? '装配成功。' : (result as string),
        updatedMap: skillManager.getSkillMap(),
      };

      // 推送 skillMapResult 消息
      const msg = MessageFactory.create('skillMapResult', responseData);
      if (msg) {
        player.sendToClient(MessageFactory.serialize(msg));
      }
    } catch (error) {
      this.logger.error('handleSkillMapRequest 失败:', error);
    }
  }

  // ================================================================
  //  3. 技能面板请求
  // ================================================================

  /**
   * 处理技能面板数据请求
   * 组装完整的面板数据：技能列表、映射、加成汇总、可选的技能详情
   */
  async handleSkillPanelRequest(
    session: Session,
    data: SkillPanelRequestData,
  ): Promise<void> {
    try {
      const player = this.getPlayerFromSession(session);
      if (!player) return;

      const skillManager = player.skillManager;
      if (!skillManager) {
        player.receiveMessage('技能系统尚未初始化。');
        return;
      }

      // 获取基础面板数据
      const listData = skillManager.buildSkillListData();
      const bonusSummary = skillManager.getSkillBonusSummary();

      // 构建响应
      const responseData: SkillPanelDataResponse = {
        skills: listData.skills,
        skillMap: listData.skillMap,
        activeForce: listData.activeForce,
        bonusSummary,
      };

      // 如果请求了技能详情
      if (data.detailSkillId) {
        const detail = this.buildSkillDetail(player, data.detailSkillId);
        if (detail) {
          responseData.detail = detail;
        }
      }

      // 推送 skillPanelData 消息
      const msg = MessageFactory.create('skillPanelData', responseData);
      if (msg) {
        player.sendToClient(MessageFactory.serialize(msg));
      }
    } catch (error) {
      this.logger.error('handleSkillPanelRequest 失败:', error);
    }
  }

  // ================================================================
  //  4. NPC 学艺
  // ================================================================

  /**
   * 处理 NPC 学艺请求
   * 校验 NPC 和技能，循环执行 times 次技能提升
   */
  async handleSkillLearnRequest(
    session: Session,
    data: SkillLearnRequestData,
  ): Promise<void> {
    try {
      const player = this.getPlayerFromSession(session);
      if (!player) return;

      const skillManager = player.skillManager;
      if (!skillManager) {
        player.receiveMessage('技能系统尚未初始化。');
        return;
      }

      // 校验 NPC 是否在当前房间
      const npc = this.findNpcInRoom(player, data.npcId);
      if (!npc) {
        player.receiveMessage('附近找不到这个人。');
        return;
      }

      // 校验 NPC 是否教授该技能
      const teachSkills = npc.get<string[]>('teach_skills');
      if (!teachSkills || !teachSkills.includes(data.skillId)) {
        player.receiveMessage(`${npc.getName()}不教授这个技能。`);
        return;
      }

      // 获取技能定义
      const skillDef = this.skillRegistry.get(data.skillId);
      if (!skillDef) {
        player.receiveMessage('未知的技能。');
        return;
      }

      // 限制 times 范围
      const times = Math.max(1, Math.min(100, data.times));

      // 检查是否已学会，未学会则先学习
      const existingSkill = skillManager.getAllSkills().find((s) => s.skillId === data.skillId);
      if (!existingSkill) {
        const learnResult = skillManager.learnSkill(data.skillId, SkillLearnSource.NPC);
        if (learnResult !== true) {
          this.sendSkillLearnResult(player, {
            success: false,
            skillId: data.skillId,
            skillName: skillDef.skillName,
            timesCompleted: 0,
            timesRequested: times,
            currentLevel: 0,
            learned: 0,
            learnedMax: 1,
            levelUp: false,
            message: learnResult,
            reason: learnResult,
          });
          return;
        }
      }

      // 循环 times 次提升技能
      let timesCompleted = 0;
      let didLevelUp = false;

      for (let i = 0; i < times; i++) {
        // 检查资源（潜能、精力、金钱等 -- 由 NPC 的学艺消耗定义决定）
        const learnCost = npc.get<number>('teach_cost') ?? 10;
        const currentSilver = player.getSilver();
        if (currentSilver < learnCost) {
          if (timesCompleted === 0) {
            this.sendSkillLearnResult(player, {
              success: false,
              skillId: data.skillId,
              skillName: skillDef.skillName,
              timesCompleted: 0,
              timesRequested: times,
              currentLevel: 0,
              learned: 0,
              learnedMax: 1,
              levelUp: false,
              message: '银两不足，无法继续学习。',
              reason: 'insufficient_silver',
            });
            return;
          }
          break;
        }

        // 检查精力
        const currentEnergy = player.get<number>('energy') ?? 0;
        if (currentEnergy < 5) {
          if (timesCompleted === 0) {
            this.sendSkillLearnResult(player, {
              success: false,
              skillId: data.skillId,
              skillName: skillDef.skillName,
              timesCompleted: 0,
              timesRequested: times,
              currentLevel: 0,
              learned: 0,
              learnedMax: 1,
              levelUp: false,
              message: '精力不足，无法继续学习。',
              reason: 'insufficient_energy',
            });
            return;
          }
          break;
        }

        // 扣除资源
        player.spendSilver(learnCost);
        player.set('energy', currentEnergy - 5);

        // 提升技能
        const improved = skillManager.improveSkill(data.skillId, 1);
        if (improved) {
          didLevelUp = true;
        }

        timesCompleted++;

        // 如果提升失败（门槛不满足等），提前结束
        // canImprove 在下一次循环 improveSkill 内部检查
      }

      // 获取最终技能数据
      const finalSkillData = skillManager.getAllSkills().find((s) => s.skillId === data.skillId);
      const currentLevel = finalSkillData?.level ?? 0;
      const learned = finalSkillData?.learned ?? 0;
      const learnedMax = Math.pow(currentLevel + 1, 2);

      // 推送学艺结果
      const message = didLevelUp
        ? `你向${npc.getName()}学习了${timesCompleted}次「${skillDef.skillName}」，技能提升到了 ${currentLevel} 级！`
        : `你向${npc.getName()}学习了${timesCompleted}次「${skillDef.skillName}」，经验增加了一些。`;

      this.sendSkillLearnResult(player, {
        success: true,
        skillId: data.skillId,
        skillName: skillDef.skillName,
        timesCompleted,
        timesRequested: times,
        currentLevel,
        learned,
        learnedMax,
        levelUp: didLevelUp,
        message,
      });
    } catch (error) {
      this.logger.error('handleSkillLearnRequest 失败:', error);
    }
  }

  // ================================================================
  //  5. 开始修炼
  // ================================================================

  /**
   * 处理开始修炼请求
   * 委托 PracticeManager 开始练功/打坐/静坐
   */
  async handlePracticeStart(session: Session, data: PracticeStartData): Promise<void> {
    try {
      const player = this.getPlayerFromSession(session);
      if (!player) return;

      const result = this.practiceManager.startPractice(player, data.skillId, data.mode);
      if (result !== true) {
        player.receiveMessage(result);
      }
    } catch (error) {
      this.logger.error('handlePracticeStart 失败:', error);
    }
  }

  // ================================================================
  //  6. 结束修炼
  // ================================================================

  /**
   * 处理结束修炼请求
   * 委托 PracticeManager 停止当前修炼
   */
  async handlePracticeEnd(session: Session, data: PracticeEndData): Promise<void> {
    try {
      const player = this.getPlayerFromSession(session);
      if (!player) return;

      this.practiceManager.stopPractice(player);
    } catch (error) {
      this.logger.error('handlePracticeEnd 失败:', error);
    }
  }

  // ================================================================
  //  内部工具方法
  // ================================================================

  /** 从 session 获取玩家对象 */
  private getPlayerFromSession(session: Session): PlayerBase | undefined {
    if (!session.authenticated || !session.playerId) return undefined;
    return this.objectManager.findById(session.playerId) as PlayerBase | undefined;
  }

  /** 在玩家所在房间中查找 NPC（按实例 ID） */
  private findNpcInRoom(player: PlayerBase, npcId: string): NpcBase | undefined {
    const room = player.getEnvironment() as RoomBase | null;
    if (!room) return undefined;

    return room
      .getInventory()
      .find((e): e is NpcBase => e instanceof NpcBase && e.id === npcId) as
      | NpcBase
      | undefined;
  }

  /** 推送 skillLearnResult 消息到客户端 */
  private sendSkillLearnResult(player: PlayerBase, data: SkillLearnResultData): void {
    const msg = MessageFactory.create('skillLearnResult', data);
    if (msg) {
      player.sendToClient(MessageFactory.serialize(msg));
    }
  }

  /**
   * 构建技能详情信息（含招式列表）
   * 用于技能面板中查看单个技能的详细信息
   */
  private buildSkillDetail(player: PlayerBase, skillId: string): SkillDetailInfo | null {
    const skillDef = this.skillRegistry.get(skillId);
    if (!skillDef) return null;

    const skillManager = player.skillManager;
    if (!skillManager) return null;

    const skillData = skillManager.getAllSkills().find((s) => s.skillId === skillId);
    if (!skillData) return null;

    // 获取技能描述（如果有）
    const description = (skillDef as any).description ?? '';

    // 获取招式列表（武学和内功都有 actions 属性）
    const rawActions: SkillAction[] = (skillDef as any).actions ?? [];
    const actions: ActionDetailInfo[] = rawActions.map((action) => ({
      skillName: action.name,
      description: action.description,
      lvl: action.lvl,
      unlocked: skillData.level >= action.lvl,
      costs: action.costs.map((cost) => ({
        resource: cost.resource,
        amount: cost.amount,
        current: player.get<number>(cost.resource) ?? 0,
      })),
      modifiers: {
        attack: action.modifiers.attack,
        damage: action.modifiers.damage,
        dodge: action.modifiers.dodge,
        parry: action.modifiers.parry,
        damageType: action.modifiers.damageType,
      },
    }));

    return {
      skillId,
      skillName: skillDef.skillName,
      description,
      actions,
    };
  }
}
