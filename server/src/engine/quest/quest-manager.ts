/**
 * QuestManager — 任务管理器
 *
 * 全局单例，负责任务系统的全部运行时逻辑：
 * - 注册任务定义（registerQuest）
 * - 前置条件检查（canAccept）
 * - 接受 / 放弃 / 完成（acceptQuest / abandonQuest / completeQuest）
 * - 进度追踪事件回调（onNpcDeath / onItemDelivered / onPlayerEnterRoom / onInventoryChange）
 * - 任务状态推送（sendQuestUpdate）
 *
 * 注册到 ServiceLocator，在 EngineModule 中初始化。
 */
import { Injectable, Logger } from '@nestjs/common';
import {
  MessageFactory,
  rt,
  type QuestUpdateData,
  type ActiveQuestInfo,
  type CompletedQuestInfo,
  type QuestObjectiveProgress,
} from '@packages/core';
import type { CommandResult } from '../types/command';
import type { PlayerBase } from '../game-objects/player-base';
import type { NpcBase } from '../game-objects/npc-base';
import type { LivingBase } from '../game-objects/living-base';
import type { ItemBase } from '../game-objects/item-base';
import type { RoomBase } from '../game-objects/room-base';
import { NpcBase as NpcBaseClass } from '../game-objects/npc-base';
import { ServiceLocator } from '../service-locator';
import { type QuestDefinition, QuestStatus, ObjectiveType } from './quest-definition';
import type { QuestProgress, PlayerQuestData } from './quest-progress';

/** NPC 任务状态摘要（用于 look / roomInfo 展示） */
export interface NpcQuestBrief {
  questId: string;
  name: string;
  description: string;
  state: 'available' | 'active' | 'ready';
  objectives?: QuestObjectiveProgress[];
}

@Injectable()
export class QuestManager {
  private readonly logger = new Logger(QuestManager.name);

  /** 任务定义注册表 Map<questId, QuestDefinition> */
  private readonly definitions: Map<string, QuestDefinition> = new Map();

  /** NPC 蓝图 ID → 该 NPC 发布的任务 ID 列表 */
  private readonly npcQuestIndex: Map<string, string[]> = new Map();

  // ================================================================
  //  任务注册
  // ================================================================

  /** 注册任务定义 */
  registerQuest(def: QuestDefinition): void {
    if (this.definitions.has(def.id)) {
      this.logger.warn(`任务定义重复注册: ${def.id}，将覆盖旧定义`);
    }
    this.definitions.set(def.id, def);

    // 更新 NPC → 任务 索引
    // 发布 NPC: 用于可接任务展示
    // 交付 NPC: 用于 READY 状态展示（确保“完成任务”按钮出现在正确 NPC 身上）
    this.addNpcQuestIndex(def.giverNpc, def.id);
    const turnInNpc = def.turnInNpc ?? def.giverNpc;
    if (turnInNpc !== def.giverNpc) {
      this.addNpcQuestIndex(turnInNpc, def.id);
    }

    this.logger.log(`任务已注册: ${def.id} (${def.name})`);
  }

  /** 获取任务定义 */
  getDefinition(questId: string): QuestDefinition | undefined {
    return this.definitions.get(questId);
  }

  // ================================================================
  //  前置条件检查
  // ================================================================

  /**
   * 检查玩家是否满足接受任务的前置条件
   * 条件包括：等级、前置任务完成、未在进行中/已完成
   */
  canAccept(player: PlayerBase, questId: string): boolean {
    const def = this.definitions.get(questId);
    if (!def) return false;

    const questData = this.getPlayerQuestData(player);

    // 已完成的任务不可重复接受
    if (questData.completed.includes(questId)) return false;

    // 已在进行中的任务不可重复接受
    if (questData.active[questId]) return false;

    // 检查前置条件
    const prereqs = def.prerequisites;
    if (prereqs) {
      // 等级需求
      if (prereqs.minLevel) {
        const playerLevel = player.get<number>('level') ?? 1;
        if (playerLevel < prereqs.minLevel) return false;
      }

      // 前置任务
      if (prereqs.completedQuests) {
        for (const reqQuestId of prereqs.completedQuests) {
          if (!questData.completed.includes(reqQuestId)) return false;
        }
      }
    }

    return true;
  }

  // ================================================================
  //  查询接口
  // ================================================================

  /**
   * 获取 NPC 对某玩家的可用任务列表
   * 只返回满足前置条件、且未完成/未在进行中的任务定义
   */
  getAvailableQuests(player: PlayerBase, npcBlueprintId: string): QuestDefinition[] {
    const questIds = this.npcQuestIndex.get(npcBlueprintId) ?? [];
    const result: QuestDefinition[] = [];

    for (const questId of questIds) {
      const def = this.definitions.get(questId);
      if (!def) continue;
      // 可接任务只在发布 NPC 身上显示
      if (def.giverNpc !== npcBlueprintId) continue;
      if (this.canAccept(player, questId)) result.push(def);
    }

    return result;
  }

  /**
   * 获取 NPC 对某玩家的任务摘要列表（用于 look / roomInfo 展示）
   * 包含三种状态: available / active / ready
   */
  getNpcQuestBriefs(player: PlayerBase, npcBlueprintId: string): NpcQuestBrief[] {
    const questIds = this.npcQuestIndex.get(npcBlueprintId) ?? [];
    const questData = this.getPlayerQuestData(player);
    const briefs: NpcQuestBrief[] = [];

    for (const questId of questIds) {
      const def = this.definitions.get(questId);
      if (!def) continue;

      // 已完成 → 跳过
      if (questData.completed.includes(questId)) continue;

      const progress = questData.active[questId];
      if (progress) {
        // 进行中或待交付
        // 只有交付 NPC 匹配才显示 ready 状态
        const turnInNpc = def.turnInNpc ?? def.giverNpc;
        const isReadyHere = progress.status === QuestStatus.READY && turnInNpc === npcBlueprintId;
        briefs.push({
          questId,
          name: def.name,
          description: def.description,
          state: isReadyHere ? 'ready' : 'active',
          objectives: this.buildObjectiveProgress(def, progress),
        });
      } else if (def.giverNpc === npcBlueprintId && this.canAccept(player, questId)) {
        // 可接受
        briefs.push({
          questId,
          name: def.name,
          description: def.description,
          state: 'available',
        });
      }
    }

    return briefs;
  }

  // ================================================================
  //  接受任务
  // ================================================================

  /**
   * 接受任务
   * 创建进度数据，给予 giveItems 物品
   */
  acceptQuest(player: PlayerBase, questId: string, npc: NpcBase): CommandResult {
    const def = this.definitions.get(questId);
    if (!def) {
      return { success: false, message: '任务不存在。' };
    }

    // 校验 NPC 是否为该任务的发布者
    const npcBlueprintId = this.getBlueprintId(npc);
    if (npcBlueprintId !== def.giverNpc) {
      return { success: false, message: '这个人没有这个任务。' };
    }

    // 检查前置条件
    if (!this.canAccept(player, questId)) {
      return { success: false, message: '你不满足接受此任务的条件。' };
    }

    // 创建任务进度
    const questData = this.getPlayerQuestData(player);
    const progress: QuestProgress = {
      questId,
      status: QuestStatus.ACTIVE,
      objectives: {},
      acceptedAt: Date.now(),
    };

    // 初始化各目标进度为 0
    for (let i = 0; i < def.objectives.length; i++) {
      progress.objectives[i] = 0;
    }

    questData.active[questId] = progress;
    this.savePlayerQuestData(player, questData);

    // 给予 giveItems 物品
    if (def.giveItems && def.giveItems.length > 0) {
      this.giveItems(player, def.giveItems);
    }

    // 接受后立即检查 collect 类型目标（玩家可能已有物品）
    this.checkCollectObjectives(player, questId);

    // 推送任务更新
    this.sendQuestUpdate(player);

    this.logger.log(`${player.getName()} 接受任务: ${def.name} (${questId})`);

    return {
      success: true,
      message: this.buildAcceptMessage(def),
    };
  }

  // ================================================================
  //  放弃任务
  // ================================================================

  /** 放弃任务，清除进度，任务回到 available */
  abandonQuest(player: PlayerBase, questId: string): CommandResult {
    const def = this.definitions.get(questId);
    if (!def) {
      return { success: false, message: '任务不存在。' };
    }

    const questData = this.getPlayerQuestData(player);
    if (!questData.active[questId]) {
      return { success: false, message: '你没有在进行这个任务。' };
    }

    // 删除进度
    delete questData.active[questId];
    this.savePlayerQuestData(player, questData);

    // 推送任务更新
    this.sendQuestUpdate(player);

    this.logger.log(`${player.getName()} 放弃任务: ${def.name} (${questId})`);

    return {
      success: true,
      message: `你放弃了任务：${def.name}`,
    };
  }

  // ================================================================
  //  完成任务（交付）
  // ================================================================

  /**
   * 交付完成任务
   * 校验 NPC 是否为交付 NPC、目标是否全部完成，然后发放奖励
   */
  completeQuest(player: PlayerBase, questId: string, npc: NpcBase): CommandResult {
    const def = this.definitions.get(questId);
    if (!def) {
      return { success: false, message: '任务不存在。' };
    }

    const questData = this.getPlayerQuestData(player);
    const progress = questData.active[questId];
    if (!progress) {
      return { success: false, message: '你没有在进行这个任务。' };
    }

    // 校验交付 NPC
    const turnInNpc = def.turnInNpc ?? def.giverNpc;
    const npcBlueprintId = this.getBlueprintId(npc);
    if (npcBlueprintId !== turnInNpc) {
      return { success: false, message: '你不在正确的 NPC 身边。' };
    }

    // 校验目标是否全部完成
    if (progress.status !== QuestStatus.READY) {
      return { success: false, message: '任务目标尚未完成。' };
    }

    // 发放奖励
    const rewards = def.rewards;
    const rewardParts: string[] = [];

    // 经验值奖励
    // 直接修改 dbase，升级检查由 ExpManager 在 gateway 层统一处理
    if (rewards.exp && rewards.exp > 0) {
      const currentExp = player.get<number>('exp') ?? 0;
      player.set('exp', currentExp + rewards.exp);
      rewardParts.push(`经验 ${rewards.exp}`);
    }

    // 银两奖励
    if (rewards.silver && rewards.silver > 0) {
      player.addSilver(rewards.silver);
      rewardParts.push(`银两 ${rewards.silver}`);
    }

    // 潜能奖励
    if (rewards.potential && rewards.potential > 0) {
      const currentPotential = player.get<number>('potential') ?? 0;
      player.set('potential', currentPotential + rewards.potential);
      rewardParts.push(`潜能 ${rewards.potential}`);
    }

    // 积分（阅历）奖励
    if (rewards.score && rewards.score > 0) {
      const currentScore = player.get<number>('score') ?? 0;
      player.set('score', currentScore + rewards.score);
      rewardParts.push(`阅历 ${rewards.score}`);
    }

    // 物品奖励
    if (rewards.items && rewards.items.length > 0) {
      this.giveItems(player, rewards.items);
      rewardParts.push('物品');
    }

    // 从 active 移除，加入 completed
    delete questData.active[questId];
    questData.completed.push(questId);
    this.savePlayerQuestData(player, questData);

    // 推送任务更新
    this.sendQuestUpdate(player);

    const rewardText = rewardParts.length > 0 ? rewardParts.join('，') : '无';
    this.logger.log(`${player.getName()} 完成任务: ${def.name} (${questId})`);

    return {
      success: true,
      message: this.buildCompleteMessage(def, rewardText),
    };
  }

  // ================================================================
  //  事件回调
  // ================================================================

  /**
   * NPC 死亡回调
   * 更新 kill 类型目标的计数
   */
  onNpcDeath(npc: NpcBase, killer: LivingBase): void {
    // 只处理玩家击杀
    const { PlayerBase: PlayerBaseClass } = require('../game-objects/player-base');
    if (!(killer instanceof PlayerBaseClass)) return;

    const player = killer as PlayerBase;
    const npcBlueprintId = this.getBlueprintId(npc);
    const questData = this.getPlayerQuestData(player);
    let changed = false;

    for (const [questId, progress] of Object.entries(questData.active)) {
      if (progress.status !== QuestStatus.ACTIVE) continue;

      const def = this.definitions.get(questId);
      if (!def) continue;
      let questChanged = false;

      for (let i = 0; i < def.objectives.length; i++) {
        const obj = def.objectives[i];
        if (obj.type === ObjectiveType.KILL && obj.targetId === npcBlueprintId) {
          const current = progress.objectives[i] ?? 0;
          if (current < obj.count) {
            progress.objectives[i] = current + 1;
            questChanged = true;
          }
        }
      }

      // 检查是否全部目标完成
      if (questChanged) {
        changed = true;
        const becameReady = this.checkQuestCompletion(def, progress);
        if (becameReady) {
          this.notifyQuestReady(player, def);
        }
      }
    }

    if (changed) {
      this.savePlayerQuestData(player, questData);
      this.sendQuestUpdate(player);
    }
  }

  /**
   * 物品交付回调
   * 更新 deliver 类型目标的计数
   */
  onItemDelivered(npc: NpcBase, giver: LivingBase, item: ItemBase): void {
    // 只处理玩家交付
    const { PlayerBase: PlayerBaseClass } = require('../game-objects/player-base');
    if (!(giver instanceof PlayerBaseClass)) return;

    const player = giver as PlayerBase;
    const npcBlueprintId = this.getBlueprintId(npc);
    const itemBlueprintId = this.getItemBlueprintId(item);
    const questData = this.getPlayerQuestData(player);
    let changed = false;

    for (const [questId, progress] of Object.entries(questData.active)) {
      if (progress.status !== QuestStatus.ACTIVE) continue;

      const def = this.definitions.get(questId);
      if (!def) continue;
      let questChanged = false;

      // deliver 目标：targetId 匹配物品蓝图 ID，且交付给正确的 NPC
      const turnInNpc = def.turnInNpc ?? def.giverNpc;
      if (turnInNpc !== npcBlueprintId) continue;

      for (let i = 0; i < def.objectives.length; i++) {
        const obj = def.objectives[i];
        if (obj.type === ObjectiveType.DELIVER && obj.targetId === itemBlueprintId) {
          const current = progress.objectives[i] ?? 0;
          if (current < obj.count) {
            progress.objectives[i] = current + 1;
            questChanged = true;
          }
        }
      }

      // 检查是否全部目标完成
      if (questChanged) {
        changed = true;
        const becameReady = this.checkQuestCompletion(def, progress);
        if (becameReady) {
          this.notifyQuestReady(player, def);
        }
      }
    }

    if (changed) {
      this.savePlayerQuestData(player, questData);
      this.sendQuestUpdate(player);
    }
  }

  /**
   * 玩家进入房间回调
   * 检查房间内 NPC 是否有可接任务，推送日志提示
   */
  onPlayerEnterRoom(player: PlayerBase, room: RoomBase): void {
    const npcsInRoom = room.getInventory().filter((e): e is NpcBase => e instanceof NpcBaseClass);

    for (const npc of npcsInRoom) {
      const npcBlueprintId = this.getBlueprintId(npc);
      const available = this.getAvailableQuests(player, npcBlueprintId);
      if (available.length > 0) {
        player.receiveMessage(`你注意到${npc.getName()}似乎有事相求。`);
      }
    }
  }

  /**
   * 玩家背包变化回调
   * 检查 collect 类型任务的物品数量
   */
  onInventoryChange(player: PlayerBase): void {
    const questData = this.getPlayerQuestData(player);
    let changed = false;

    for (const [questId, progress] of Object.entries(questData.active)) {
      if (progress.status !== QuestStatus.ACTIVE) continue;

      const def = this.definitions.get(questId);
      if (!def) continue;
      let questChanged = false;

      for (let i = 0; i < def.objectives.length; i++) {
        const obj = def.objectives[i];
        if (obj.type !== ObjectiveType.COLLECT) continue;

        const count = this.countPlayerItems(player, obj.targetId);
        const oldCount = progress.objectives[i] ?? 0;
        if (count !== oldCount) {
          progress.objectives[i] = Math.min(count, obj.count);
          questChanged = true;
        }
      }

      if (questChanged) {
        changed = true;
        const becameReady = this.checkQuestCompletion(def, progress);
        if (becameReady) {
          this.notifyQuestReady(player, def);
        }
      }
    }

    if (changed) {
      this.savePlayerQuestData(player, questData);
      this.sendQuestUpdate(player);
    }
  }

  // ================================================================
  //  消息推送
  // ================================================================

  /** 构建 QuestUpdateData 并推送到前端 */
  sendQuestUpdate(player: PlayerBase): void {
    const questData = this.getPlayerQuestData(player);

    // 构建 active 列表
    const active: ActiveQuestInfo[] = [];
    for (const [questId, progress] of Object.entries(questData.active)) {
      const def = this.definitions.get(questId);
      if (!def) continue;

      active.push({
        questId,
        name: def.name,
        description: def.description,
        type: def.type,
        giverNpcName: this.resolveNpcName(def.giverNpc),
        status: progress.status === QuestStatus.READY ? 'ready' : 'active',
        objectives: this.buildObjectiveProgress(def, progress),
        acceptedAt: progress.acceptedAt,
      });
    }

    // 构建 completed 列表
    const completed: CompletedQuestInfo[] = [];
    for (const questId of questData.completed) {
      const def = this.definitions.get(questId);
      if (def) {
        completed.push({ questId, name: def.name });
      }
    }

    const updateData: QuestUpdateData = {
      active,
      completed,
      exp: player.get<number>('exp') ?? 0,
      level: player.get<number>('level') ?? 1,
      potential: player.get<number>('potential') ?? 0,
      score: player.get<number>('score') ?? 0,
      freePoints: player.get<number>('free_points') ?? 0,
    };

    const msg = MessageFactory.create('questUpdate', updateData);
    if (msg) {
      player.sendToClient(MessageFactory.serialize(msg));
    }
  }

  // ================================================================
  //  内部工具方法
  // ================================================================

  /** 获取玩家任务数据（从 dbase 读取，不存在则初始化空结构） */
  private getPlayerQuestData(player: PlayerBase): PlayerQuestData {
    const data = player.get<PlayerQuestData>('quests');
    if (data && typeof data === 'object' && data.active && Array.isArray(data.completed)) {
      return data;
    }
    // 初始化空数据
    const empty: PlayerQuestData = { active: {}, completed: [] };
    player.set('quests', empty);
    return empty;
  }

  /** 保存玩家任务数据到 dbase */
  private savePlayerQuestData(player: PlayerBase, data: PlayerQuestData): void {
    player.set('quests', data);
  }

  /** 维护 NPC → 任务 索引 */
  private addNpcQuestIndex(npcBlueprintId: string, questId: string): void {
    const existing = this.npcQuestIndex.get(npcBlueprintId) ?? [];
    if (!existing.includes(questId)) {
      existing.push(questId);
    }
    this.npcQuestIndex.set(npcBlueprintId, existing);
  }

  /** 从实例 ID 提取蓝图 ID（如 "npc/guard#1" → "npc/guard"） */
  private getBlueprintId(entity: NpcBase | LivingBase): string {
    return entity.id.split('#')[0];
  }

  /** 从物品实例 ID 提取蓝图 ID */
  private getItemBlueprintId(item: ItemBase): string {
    return item.id.split('#')[0];
  }

  /** 检查任务是否所有目标都已完成，如果是则切换状态到 READY 并返回 true */
  private checkQuestCompletion(def: QuestDefinition, progress: QuestProgress): boolean {
    if (progress.status !== QuestStatus.ACTIVE) return false;

    const allComplete = def.objectives.every((obj, i) => {
      const current = progress.objectives[i] ?? 0;
      return current >= obj.count;
    });

    if (allComplete) {
      progress.status = QuestStatus.READY;
      return true;
    }

    return false;
  }

  /**
   * 检查 collect 类型目标（接受任务后立即检查）
   * 玩家可能已有所需物品
   */
  private checkCollectObjectives(player: PlayerBase, questId: string): void {
    const questData = this.getPlayerQuestData(player);
    const progress = questData.active[questId];
    if (!progress) return;

    const def = this.definitions.get(questId);
    if (!def) return;

    let changed = false;
    for (let i = 0; i < def.objectives.length; i++) {
      const obj = def.objectives[i];
      if (obj.type !== ObjectiveType.COLLECT) continue;

      const count = this.countPlayerItems(player, obj.targetId);
      const oldCount = progress.objectives[i] ?? 0;
      const nextCount = Math.min(count, obj.count);
      if (nextCount !== oldCount) {
        progress.objectives[i] = nextCount;
        changed = true;
      }
    }

    if (changed) {
      const becameReady = this.checkQuestCompletion(def, progress);
      if (becameReady) {
        this.notifyQuestReady(player, def);
      }
      this.savePlayerQuestData(player, questData);
    }
  }

  /** 构建任务接受日志（支持富文本文案） */
  private buildAcceptMessage(def: QuestDefinition): string {
    return [def.flavorText?.onAccept, rt('sys', `你接受了任务：${def.name}`)]
      .filter((line): line is string => !!line && line.trim().length > 0)
      .join('\n');
  }

  /** 构建任务完成日志（支持富文本文案） */
  private buildCompleteMessage(def: QuestDefinition, rewardText: string): string {
    return [
      def.flavorText?.onComplete,
      rt('sys', `任务完成：${def.name}`),
      rt('sys', `你获得了${rewardText}`),
    ]
      .filter((line): line is string => !!line && line.trim().length > 0)
      .join('\n');
  }

  /** 任务达成可交付时推送提示文案 */
  private notifyQuestReady(player: PlayerBase, def: QuestDefinition): void {
    const readyMessage =
      def.flavorText?.onReady ?? rt('sys', `任务「${def.name}」目标已达成，可前往交付。`);
    player.receiveMessage(readyMessage);
  }

  /** 统计玩家背包中指定蓝图 ID 物品的数量 */
  private countPlayerItems(player: PlayerBase, itemBlueprintId: string): number {
    let count = 0;
    for (const child of player.getInventory()) {
      const childBlueprintId = child.id.split('#')[0];
      if (childBlueprintId === itemBlueprintId) {
        count++;
      }
    }
    return count;
  }

  /** 给予玩家物品 */
  private giveItems(player: PlayerBase, items: { blueprintId: string; count: number }[]): void {
    if (!ServiceLocator.initialized || !ServiceLocator.blueprintFactory) return;

    for (const { blueprintId, count } of items) {
      for (let i = 0; i < count; i++) {
        try {
          const item = ServiceLocator.blueprintFactory.clone(blueprintId);
          item.moveTo(player, { quiet: true });
        } catch (err) {
          this.logger.warn(`任务物品给予失败: ${blueprintId} → ${err}`);
        }
      }
    }
  }

  /** 构建目标进度数组 */
  private buildObjectiveProgress(
    def: QuestDefinition,
    progress: QuestProgress,
  ): QuestObjectiveProgress[] {
    return def.objectives.map((obj, i) => {
      const current = progress.objectives[i] ?? 0;
      return {
        description: obj.description,
        current: Math.min(current, obj.count),
        required: obj.count,
        completed: current >= obj.count,
      };
    });
  }

  /** 解析 NPC 蓝图 ID 对应的名字（尝试从 ObjectManager 查找） */
  private resolveNpcName(npcBlueprintId: string): string {
    if (!ServiceLocator.initialized || !ServiceLocator.objectManager) {
      return npcBlueprintId;
    }

    // 尝试查找任意一个该蓝图的实例
    const instance = ServiceLocator.objectManager.findAll(
      (e) => e.id.split('#')[0] === npcBlueprintId && e instanceof NpcBaseClass,
    )[0];

    if (instance) {
      return (instance as NpcBase).getName();
    }

    return npcBlueprintId;
  }
}
