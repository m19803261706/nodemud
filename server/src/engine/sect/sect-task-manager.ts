/**
 * 门派任务管理器
 * 负责日常/周常任务的模板池管理、任务生成、接取/完成/放弃/超时生命周期。
 */
import { Injectable, Logger } from '@nestjs/common';
import { rt } from '@packages/core';
import { SectRegistry } from './sect-registry';
import type { SectPolicy } from './policies/sect-policy';
import type { PlayerBase } from '../game-objects/player-base';
import {
  type SectTaskTemplate,
  type SectTaskInstance,
  type SectTaskRewards,
  type PlayerSectTaskData,
  type PlayerSectData,
  type TaskGenContext,
  EMPTY_PLAYER_SECT_TASK_DATA,
  clonePlayerSectTaskData,
} from './types';

/** 里程碑阈值 */
const MILESTONES = [10, 30, 50, 100, 200, 500];

/** 日常任务超时（30 分钟，毫秒） */
const DAILY_TIMEOUT_MS = 30 * 60 * 1000;

/** 周常任务超时（无超时，设一个很大的值） */
const WEEKLY_TIMEOUT_MS = 7 * 24 * 60 * 60 * 1000;

/** 任务展示给客户端的候选数量 */
const MAX_CANDIDATE_COUNT = 3;

@Injectable()
export class SectTaskManager {
  private readonly logger = new Logger(SectTaskManager.name);

  /** 通用日常模板池 */
  private readonly commonDailyPool: SectTaskTemplate[] = [];
  /** 通用周常模板池 */
  private readonly commonWeeklyPool: SectTaskTemplate[] = [];

  constructor(private readonly registry: SectRegistry) {}

  // ========== 模板注册 ==========

  /** 注册通用模板 */
  registerCommonTemplate(template: SectTaskTemplate): void {
    if (template.category === 'daily') {
      this.commonDailyPool.push(template);
    } else {
      this.commonWeeklyPool.push(template);
    }
    this.logger.debug(`注册通用${template.category === 'daily' ? '日常' : '周常'}模板: ${template.templateId}`);
  }

  // ========== 任务列表 ==========

  /**
   * 获取玩家可用任务列表及当前进度
   */
  getAvailableTasks(
    player: PlayerBase,
    sectData: PlayerSectData,
  ): {
    activeDailyTask: SectTaskInstance | null;
    activeWeeklyTask: SectTaskInstance | null;
    dailyCount: number;
    dailyMax: number;
    weeklyCount: number;
    weeklyMax: number;
    totalCompleted: number;
    nextMilestone: number | null;
    availableDailyTemplates: { templateId: string; name: string }[];
    availableWeeklyTemplates: { templateId: string; name: string }[];
  } {
    if (!sectData.current) {
      return this.emptyResponse();
    }

    const policy = this.registry.get(sectData.current.sectId);
    if (!policy) {
      return this.emptyResponse();
    }

    const taskData = this.getTaskData(sectData);
    const countersReset = this.resetCountersIfNeeded(taskData);

    const rank = sectData.current.rank;
    const dailyMax = policy.getDailyTaskLimit(rank);
    const weeklyMax = policy.getWeeklyTaskLimit(rank);

    // 日/周计数重置后需持久化
    if (countersReset) {
      sectData.sectTaskData = JSON.parse(JSON.stringify(taskData));
    }

    // 筛选可用模板
    const dailyCandidates = taskData.activeDailyTask
      ? []
      : this.filterTemplates(policy, 'daily').slice(0, MAX_CANDIDATE_COUNT);
    const weeklyCandidates = taskData.activeWeeklyTask
      ? []
      : this.filterTemplates(policy, 'weekly').slice(0, MAX_CANDIDATE_COUNT);

    return {
      activeDailyTask: taskData.activeDailyTask,
      activeWeeklyTask: taskData.activeWeeklyTask,
      dailyCount: taskData.daily.completed,
      dailyMax,
      weeklyCount: taskData.weekly.completed,
      weeklyMax,
      totalCompleted: taskData.totalCompleted,
      nextMilestone: this.getNextMilestone(taskData),
      availableDailyTemplates: dailyCandidates.map((t) => ({
        templateId: t.templateId,
        name: t.name,
      })),
      availableWeeklyTemplates: weeklyCandidates.map((t) => ({
        templateId: t.templateId,
        name: t.name,
      })),
    };
  }

  // ========== 接取任务 ==========

  /**
   * 接取任务
   * @returns 成功时返回 { success, task, message }，失败返回 { success: false, message }
   */
  acceptTask(
    player: PlayerBase,
    sectData: PlayerSectData,
    templateId: string,
    category: 'daily' | 'weekly',
  ): { success: boolean; message: string; task?: SectTaskInstance } {
    if (!sectData.current) {
      return { success: false, message: '你尚未加入任何门派。' };
    }

    const policy = this.registry.get(sectData.current.sectId);
    if (!policy) {
      return { success: false, message: '门派配置异常。' };
    }

    const taskData = this.getTaskData(sectData);
    this.resetCountersIfNeeded(taskData);

    // 检查是否已有进行中任务
    if (category === 'daily' && taskData.activeDailyTask) {
      return { success: false, message: '你已有进行中的日常任务，请先完成或放弃。' };
    }
    if (category === 'weekly' && taskData.activeWeeklyTask) {
      return { success: false, message: '你已有进行中的周常任务，请先完成或放弃。' };
    }

    // 检查次数上限
    const rank = sectData.current.rank;
    if (category === 'daily') {
      const limit = policy.getDailyTaskLimit(rank);
      if (taskData.daily.completed >= limit) {
        return { success: false, message: `今日日常任务已达上限（${limit}次）。` };
      }
    } else {
      const limit = policy.getWeeklyTaskLimit(rank);
      if (taskData.weekly.completed >= limit) {
        return { success: false, message: `本周周常任务已达上限（${limit}次）。` };
      }
    }

    // 查找模板
    const template = this.findTemplate(policy, templateId, category);
    if (!template) {
      return { success: false, message: '找不到指定的任务模板。' };
    }

    // 生成任务实例
    const context = this.buildGenContext(player, policy, sectData);
    const instance = template.paramGen(context);

    // 设置接取时间和超时
    const now = Date.now();
    const enrichedInstance: SectTaskInstance = {
      ...instance,
      templateId: template.templateId,
      category,
      timeLimit: category === 'daily' ? DAILY_TIMEOUT_MS : WEEKLY_TIMEOUT_MS,
      acceptedAt: now,
    };

    // 写入活跃任务
    if (category === 'daily') {
      taskData.activeDailyTask = enrichedInstance;
    } else {
      taskData.activeWeeklyTask = enrichedInstance;
    }

    this.saveTaskData(player, sectData, taskData);

    // 发送接取消息
    player.receiveMessage(
      rt('sys', `你接取了${category === 'daily' ? '日常' : '周常'}任务：`) +
        rt('skill', enrichedInstance.name),
    );
    if (enrichedInstance.flavorText.onAssign) {
      player.receiveMessage(rt('emote', enrichedInstance.flavorText.onAssign));
    }

    return { success: true, message: '任务接取成功。', task: enrichedInstance };
  }

  // ========== 完成任务 ==========

  /**
   * 完成（交付）任务
   */
  completeTask(
    player: PlayerBase,
    sectData: PlayerSectData,
    category: 'daily' | 'weekly',
  ): {
    success: boolean;
    message: string;
    rewards?: SectTaskRewards;
    milestoneRewards?: SectTaskRewards;
  } {
    const taskData = this.getTaskData(sectData);
    const activeTask =
      category === 'daily' ? taskData.activeDailyTask : taskData.activeWeeklyTask;

    if (!activeTask) {
      return { success: false, message: '没有进行中的任务。' };
    }

    // 检查目标是否全部达成
    const allDone = activeTask.objectives.every((obj) => obj.current >= obj.count);
    if (!allDone) {
      return { success: false, message: '任务目标尚未完成。' };
    }

    // 发放奖励
    const rewards = activeTask.rewards;
    this.grantRewards(player, sectData, rewards);

    // 更新计数
    if (category === 'daily') {
      taskData.daily.completed++;
      taskData.activeDailyTask = null;
    } else {
      taskData.weekly.completed++;
      taskData.activeWeeklyTask = null;
    }
    taskData.totalCompleted++;

    // 检查里程碑
    const milestoneRewards = this.checkMilestone(player, sectData, taskData);

    this.saveTaskData(player, sectData, taskData);

    // 完成消息
    player.receiveMessage(
      rt('sys', `${category === 'daily' ? '日常' : '周常'}任务`) +
        rt('skill', activeTask.name) +
        rt('sys', '已完成！'),
    );
    if (activeTask.flavorText.onComplete) {
      player.receiveMessage(rt('emote', activeTask.flavorText.onComplete));
    }
    this.sendRewardMessage(player, rewards);

    return {
      success: true,
      message: '任务完成。',
      rewards,
      milestoneRewards: milestoneRewards ?? undefined,
    };
  }

  // ========== 放弃任务 ==========

  /**
   * 放弃任务（扣一次次数）
   */
  abandonTask(
    player: PlayerBase,
    sectData: PlayerSectData,
    category: 'daily' | 'weekly',
  ): { success: boolean; message: string } {
    const taskData = this.getTaskData(sectData);
    const activeTask =
      category === 'daily' ? taskData.activeDailyTask : taskData.activeWeeklyTask;

    if (!activeTask) {
      return { success: false, message: '没有进行中的任务。' };
    }

    // 扣次数
    if (category === 'daily') {
      taskData.daily.completed++;
      taskData.activeDailyTask = null;
    } else {
      taskData.weekly.completed++;
      taskData.activeWeeklyTask = null;
    }

    this.saveTaskData(player, sectData, taskData);

    player.receiveMessage(
      rt('sys', '你放弃了任务') +
        rt('skill', activeTask.name) +
        rt('sys', '，本次机会已消耗。'),
    );

    return { success: true, message: '任务已放弃。' };
  }

  // ========== 超时检查 ==========

  /**
   * 检查日常任务超时（由心跳调用）
   * 超时不扣次数，只清除活跃任务
   */
  checkExpiry(player: PlayerBase, sectData: PlayerSectData): boolean {
    const taskData = this.getTaskData(sectData);
    const now = Date.now();
    let expired = false;

    // 检查日常任务超时
    if (taskData.activeDailyTask && taskData.activeDailyTask.acceptedAt) {
      const elapsed = now - taskData.activeDailyTask.acceptedAt;
      if (elapsed >= taskData.activeDailyTask.timeLimit) {
        const taskName = taskData.activeDailyTask.name;
        taskData.activeDailyTask = null;
        expired = true;
        player.receiveMessage(
          rt('sys', '日常任务') + rt('skill', taskName) + rt('sys', '已超时，任务取消。'),
        );
      }
    }

    // 检查周常任务超时
    if (taskData.activeWeeklyTask && taskData.activeWeeklyTask.acceptedAt) {
      const elapsed = now - taskData.activeWeeklyTask.acceptedAt;
      if (elapsed >= taskData.activeWeeklyTask.timeLimit) {
        const taskName = taskData.activeWeeklyTask.name;
        taskData.activeWeeklyTask = null;
        expired = true;
        player.receiveMessage(
          rt('sys', '周常任务') + rt('skill', taskName) + rt('sys', '已超时，任务取消。'),
        );
      }
    }

    if (expired) {
      this.saveTaskData(player, sectData, taskData);
    }

    return expired;
  }

  // ========== 任务进度更新 ==========

  /**
   * 更新任务目标进度
   * @returns 是否有进度变化
   */
  updateObjectiveProgress(
    player: PlayerBase,
    sectData: PlayerSectData,
    type: string,
    targetId: string,
    delta: number = 1,
  ): boolean {
    const taskData = this.getTaskData(sectData);
    let changed = false;

    // 检查日常任务
    if (taskData.activeDailyTask) {
      if (this.updateTaskObjectives(taskData.activeDailyTask, type, targetId, delta)) {
        changed = true;
      }
    }

    // 检查周常任务
    if (taskData.activeWeeklyTask) {
      if (this.updateTaskObjectives(taskData.activeWeeklyTask, type, targetId, delta)) {
        changed = true;
      }
    }

    if (changed) {
      this.saveTaskData(player, sectData, taskData);
    }

    return changed;
  }

  // ========== 私有方法 ==========

  /** 获取任务数据（带防御性归一化） */
  private getTaskData(sectData: PlayerSectData): PlayerSectTaskData {
    return sectData.sectTaskData ?? clonePlayerSectTaskData(EMPTY_PLAYER_SECT_TASK_DATA);
  }

  /** 保存任务数据回 sectData 并持久化（深拷贝防止引用污染） */
  private saveTaskData(
    player: PlayerBase,
    sectData: PlayerSectData,
    taskData: PlayerSectTaskData,
  ): void {
    sectData.sectTaskData = JSON.parse(JSON.stringify(taskData));
    player.set('sect', JSON.parse(JSON.stringify(sectData)));
  }

  /** 获取当日日期键 */
  private getTodayKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  /** 获取本周周键（以周一 0 点为分界） */
  private getWeekKey(): string {
    const now = new Date();
    const day = now.getDay() || 7; // 周日=0 → 7
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + 1);
    return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
  }

  /** 重置过期的日/周计数，返回是否有变更 */
  private resetCountersIfNeeded(taskData: PlayerSectTaskData): boolean {
    let changed = false;

    const todayKey = this.getTodayKey();
    if (taskData.daily.dateKey !== todayKey) {
      taskData.daily.dateKey = todayKey;
      taskData.daily.completed = 0;
      taskData.activeDailyTask = null;
      changed = true;
    }

    const weekKey = this.getWeekKey();
    if (taskData.weekly.weekKey !== weekKey) {
      taskData.weekly.weekKey = weekKey;
      taskData.weekly.completed = 0;
      taskData.activeWeeklyTask = null;
      changed = true;
    }

    return changed;
  }

  /** 按阵营/门风/类别筛选模板 */
  private filterTemplates(
    policy: SectPolicy,
    category: 'daily' | 'weekly',
  ): SectTaskTemplate[] {
    // 混合通用池和门派特色池
    const commonPool = category === 'daily' ? this.commonDailyPool : this.commonWeeklyPool;
    const customPool = category === 'daily'
      ? policy.getCustomDailyPool()
      : policy.getCustomWeeklyPool();

    const allTemplates = [...commonPool, ...customPool];

    // 按阵营和门风过滤
    const filtered = allTemplates.filter((t) => {
      if (t.alignmentFilter && !t.alignmentFilter.includes(policy.alignment)) {
        return false;
      }
      if (t.toneFilter && !t.toneFilter.includes(policy.tone)) {
        return false;
      }
      return true;
    });

    // 按权重随机排序
    return this.weightedShuffle(filtered);
  }

  /** 按权重随机打乱 */
  private weightedShuffle(templates: SectTaskTemplate[]): SectTaskTemplate[] {
    return templates
      .map((t) => ({ t, sort: Math.random() * t.weight }))
      .sort((a, b) => b.sort - a.sort)
      .map((item) => item.t);
  }

  /** 查找特定模板 */
  private findTemplate(
    policy: SectPolicy,
    templateId: string,
    category: 'daily' | 'weekly',
  ): SectTaskTemplate | undefined {
    const commonPool = category === 'daily' ? this.commonDailyPool : this.commonWeeklyPool;
    const customPool = category === 'daily'
      ? policy.getCustomDailyPool()
      : policy.getCustomWeeklyPool();

    return [...commonPool, ...customPool].find(
      (t) => t.templateId === templateId && t.category === category,
    );
  }

  /** 构建任务生成上下文 */
  private buildGenContext(
    player: PlayerBase,
    policy: SectPolicy,
    sectData: PlayerSectData,
  ): TaskGenContext {
    return {
      player,
      sectPolicy: policy,
      sectData,
      areaRoomIds: [], // 由调用方按需填充
      hostileNpcIds: [], // 由调用方按需填充
    };
  }

  /** 发放奖励 */
  private grantRewards(
    player: PlayerBase,
    sectData: PlayerSectData,
    rewards: SectTaskRewards,
  ): void {
    // 门派贡献
    if (rewards.contribution > 0 && sectData.current) {
      sectData.current.contribution += rewards.contribution;
    }

    // 经验
    if (rewards.exp && rewards.exp > 0) {
      const currentExp = player.get<number>('exp') ?? 0;
      player.set('exp', currentExp + rewards.exp);
    }

    // 潜能
    if (rewards.potential && rewards.potential > 0) {
      const currentPotential = player.get<number>('potential') ?? 0;
      player.set('potential', currentPotential + rewards.potential);
    }

    // 银两
    if (rewards.silver && rewards.silver > 0) {
      const currentSilver = player.get<number>('silver') ?? 0;
      player.set('silver', currentSilver + rewards.silver);
    }

    // 物品奖励暂留接口（后续实现）
  }

  /** 发送奖励消息 */
  private sendRewardMessage(player: PlayerBase, rewards: SectTaskRewards): void {
    const parts: string[] = [];
    if (rewards.contribution > 0) parts.push(`贡献 +${rewards.contribution}`);
    if (rewards.exp) parts.push(`经验 +${rewards.exp}`);
    if (rewards.potential) parts.push(`潜能 +${rewards.potential}`);
    if (rewards.silver) parts.push(`银两 +${rewards.silver}`);

    if (parts.length > 0) {
      player.receiveMessage(rt('sys', `获得奖励：${parts.join('，')}`));
    }
  }

  /** 检查并发放里程碑奖励 */
  private checkMilestone(
    player: PlayerBase,
    sectData: PlayerSectData,
    taskData: PlayerSectTaskData,
  ): SectTaskRewards | null {
    for (const milestone of MILESTONES) {
      if (
        taskData.totalCompleted >= milestone &&
        !taskData.milestonesClaimed.includes(milestone)
      ) {
        taskData.milestonesClaimed.push(milestone);
        const rewards = this.getMilestoneRewards(milestone);
        this.grantRewards(player, sectData, rewards);
        player.receiveMessage(
          rt('imp', `【里程碑】`) +
            rt('sys', `累计完成 ${milestone} 个门派任务！获得额外奖励。`),
        );
        this.sendRewardMessage(player, rewards);
        return rewards;
      }
    }
    return null;
  }

  /** 里程碑奖励表 */
  private getMilestoneRewards(milestone: number): SectTaskRewards {
    switch (milestone) {
      case 10:
        return { contribution: 50, exp: 100, potential: 20 };
      case 30:
        return { contribution: 100, exp: 300, potential: 50 };
      case 50:
        return { contribution: 200, exp: 500, potential: 100, silver: 500 };
      case 100:
        return { contribution: 500, exp: 1000, potential: 200, silver: 1000 };
      case 200:
        return { contribution: 1000, exp: 2000, potential: 500, silver: 2000 };
      case 500:
        return { contribution: 2000, exp: 5000, potential: 1000, silver: 5000 };
      default:
        return { contribution: 50 };
    }
  }

  /** 获取下一个未领取的里程碑 */
  private getNextMilestone(taskData: PlayerSectTaskData): number | null {
    for (const m of MILESTONES) {
      if (!taskData.milestonesClaimed.includes(m)) return m;
    }
    return null;
  }

  /** 更新单个任务的目标进度 */
  private updateTaskObjectives(
    task: SectTaskInstance,
    type: string,
    targetId: string,
    delta: number,
  ): boolean {
    let changed = false;
    for (const obj of task.objectives) {
      if (obj.type === type && obj.targetId === targetId && obj.current < obj.count) {
        obj.current = Math.min(obj.current + delta, obj.count);
        changed = true;
      }
    }
    return changed;
  }

  /** 空响应 */
  private emptyResponse() {
    return {
      activeDailyTask: null,
      activeWeeklyTask: null,
      dailyCount: 0,
      dailyMax: 0,
      weeklyCount: 0,
      weeklyMax: 0,
      totalCompleted: 0,
      nextMilestone: null,
      availableDailyTemplates: [],
      availableWeeklyTemplates: [],
    };
  }
}
