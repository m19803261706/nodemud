import { Injectable, Logger } from '@nestjs/common';
import { rt } from '@packages/core';
import type { CommandResult } from '../types/command';
import type { NpcBase } from '../game-objects/npc-base';
import { PlayerBase } from '../game-objects/player-base';
import { ServiceLocator } from '../service-locator';
import {
  clonePlayerWorkData,
  EMPTY_PLAYER_WORK_DATA,
  normalizePlayerWorkData,
  type PlayerWorkData,
} from './types';

const WORK_TICK_MS = 2200;

const NEWBIE_MAX_LEVEL = 15;
const NEWBIE_MAX_EXP = 120000;
const NEWBIE_MAX_SCORE = 800;

const DAILY_EXP_CAP = 5000;
const DAILY_POTENTIAL_CAP = 3000;

const WORK_PLANS = {
  once: { key: 'once', label: '一轮', rounds: 1 },
  short: { key: 'short', label: '五轮', rounds: 5 },
  medium: { key: 'medium', label: '二十轮', rounds: 20 },
  auto: { key: 'auto', label: '持续', rounds: null },
} as const;

type WorkPlanKey = keyof typeof WORK_PLANS;

type WorkJobId =
  | 'rift.copy-script'
  | 'rift.drill-form'
  | 'rift.sort-herb'
  | 'rift.forge-assist';

interface WorkJobDefinition {
  id: WorkJobId;
  title: string;
  summary: string;
  tags: string[];
  npcBlueprintIds: string[];
  estimateCost: {
    hp: number;
    energy: number;
  };
  estimateReward: {
    exp: number;
    potential: number;
    silver: number;
  };
  roleplayLines: string[];
  newbieHint: string;
  recommendedAttr: string;
  rollCost: (player: PlayerBase) => { hp: number; energy: number };
  rollReward: (player: PlayerBase) => { exp: number; potential: number; silver: number };
}

interface WorkSession {
  playerId: string;
  npcId: string;
  npcName: string;
  npcBlueprintId: string;
  job: WorkJobDefinition;
  plan: WorkPlanKey;
  roundsPlanned: number | null;
  roundsCompleted: number;
  gainedExp: number;
  gainedPotential: number;
  gainedSilver: number;
  timer: ReturnType<typeof setInterval>;
}

interface WorkOfferView {
  jobId: WorkJobId;
  title: string;
  summary: string;
  tags: string[];
  recommendedAttr: string;
  newbieHint: string;
  estimateCost: { hp: number; energy: number };
  estimateReward: { exp: number; potential: number; silver: number };
  dailyCap: { exp: number; potential: number };
  eligible: boolean;
  reason?: string;
  planOptions: Array<{ key: WorkPlanKey; label: string; rounds: number | null }>;
}

interface StartWorkParams {
  npc: NpcBase;
  jobId: string;
  plan: string;
}

function clampToInt(value: number, min = 0): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.floor(value));
}

function todayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, '0');
  const d = `${now.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function rollBetween(min: number, max: number): number {
  if (max <= min) return clampToInt(min, 0);
  return clampToInt(min + Math.random() * (max - min + 1), 0);
}

function attr(player: PlayerBase, key: string): number {
  return clampToInt(player.get<number>(key) ?? 0, 0);
}

function scoreFactor(score: number, baseline = 24): number {
  const delta = score - baseline;
  const next = 1 + delta / 120;
  return Math.max(0.82, Math.min(1.22, next));
}

const WORK_JOB_DEFS: WorkJobDefinition[] = [
  {
    id: 'rift.copy-script',
    title: '抄录经卷',
    summary: '在书院抄录旧卷，按句核对，誊写成册。',
    tags: ['文事', '稳心', '耐性'],
    npcBlueprintIds: ['npc/rift-town/academy-lecturer'],
    estimateCost: { hp: 1, energy: 5 },
    estimateReward: { exp: 26, potential: 22, silver: 16 },
    roleplayLines: [
      '提笔落墨，你沿着旧卷的行格一字一字摹写，心气渐稳。',
      '窗纸微动，夫子敲了敲案角：字要稳，心也要稳。',
      '你将误写的一行重抄，墨香与纸香混在一起，恍若夜雨入檐。',
      '最后一页钉线收口，卷册平整，温夫子轻轻点头。',
    ],
    newbieHint: '适合刚入江湖、想先补潜能与基础阅历的少侠。',
    recommendedAttr: '悟性/根骨',
    rollCost: (player) => {
      const wis = attr(player, 'wisdom');
      const per = attr(player, 'perception');
      const reduce = Math.floor((wis + per) / 16);
      return {
        hp: 1,
        energy: Math.max(3, 6 - reduce),
      };
    },
    rollReward: (player) => {
      const wis = attr(player, 'wisdom');
      const per = attr(player, 'perception');
      const factor = scoreFactor(wis + per);
      return {
        exp: clampToInt(rollBetween(20, 30) * factor, 1),
        potential: clampToInt(rollBetween(18, 26) * factor, 1),
        silver: clampToInt(rollBetween(12, 20), 1),
      };
    },
  },
  {
    id: 'rift.drill-form',
    title: '陪练木桩',
    summary: '在武馆按教头口令走桩、拆招，打磨基本架势。',
    tags: ['武事', '筋骨', '步法'],
    npcBlueprintIds: ['npc/rift-town/martial-instructor'],
    estimateCost: { hp: 1, energy: 4 },
    estimateReward: { exp: 30, potential: 14, silver: 20 },
    roleplayLines: [
      '木桩连响，陈教头竹杆一点：脚先到，手后发。',
      '你按口令换步回身，肩背发热，汗珠顺着鬓角落下。',
      '一轮拆招走完，你收势吐气，胸口起伏渐平。',
      '教头抬眼道：架子比方才稳了，回去再练三遍。',
    ],
    newbieHint: '适合想把前期战斗手感练稳的新人。',
    recommendedAttr: '力量/体质',
    rollCost: (player) => {
      const str = attr(player, 'strength');
      const vit = attr(player, 'vitality');
      const reduce = Math.floor((str + vit) / 18);
      return {
        hp: 1,
        energy: Math.max(2, 5 - Math.floor(reduce / 2)),
      };
    },
    rollReward: (player) => {
      const str = attr(player, 'strength');
      const vit = attr(player, 'vitality');
      const factor = scoreFactor(str + vit);
      return {
        exp: clampToInt(rollBetween(24, 36) * factor, 1),
        potential: clampToInt(rollBetween(10, 16) * factor, 1),
        silver: clampToInt(rollBetween(16, 26), 1),
      };
    },
  },
  {
    id: 'rift.sort-herb',
    title: '分拣草药',
    summary: '在药铺将草药分拣、晒切、封包，磨熟药理手感。',
    tags: ['药事', '细心', '吐纳'],
    npcBlueprintIds: ['npc/rift-town/herbalist'],
    estimateCost: { hp: 1, energy: 6 },
    estimateReward: { exp: 22, potential: 24, silver: 14 },
    roleplayLines: [
      '白发药师递来药筛，你将草根与叶末分开，按份码齐。',
      '药臼微响，你照着方子捣碎药材，苦香扑鼻却不刺喉。',
      '封包系口时，你刻意放缓手劲，生怕走了药性。',
      '药师验过药包，只道一句：手稳，心也稳。',
    ],
    newbieHint: '潜能产出偏高，适合学艺前补一补底子。',
    recommendedAttr: '悟性/灵犀',
    rollCost: (player) => {
      const wis = attr(player, 'wisdom');
      const spi = attr(player, 'spirit');
      const reduce = Math.floor((wis + spi) / 18);
      return {
        hp: 1,
        energy: Math.max(4, 7 - reduce),
      };
    },
    rollReward: (player) => {
      const wis = attr(player, 'wisdom');
      const spi = attr(player, 'spirit');
      const factor = scoreFactor(wis + spi);
      return {
        exp: clampToInt(rollBetween(18, 28) * factor, 1),
        potential: clampToInt(rollBetween(18, 30) * factor, 1),
        silver: clampToInt(rollBetween(10, 18), 1),
      };
    },
  },
  {
    id: 'rift.forge-assist',
    title: '炉前打杂',
    summary: '在铁匠铺鼓风、翻料、淬火，帮老周赶工。',
    tags: ['工事', '力气', '火候'],
    npcBlueprintIds: ['npc/rift-town/blacksmith'],
    estimateCost: { hp: 1, energy: 3 },
    estimateReward: { exp: 28, potential: 14, silver: 24 },
    roleplayLines: [
      '火门一开，热浪扑面，你咬牙拉动风箱，炉火立刻窜高。',
      '铁坯出炉，你按老周的手势翻面落锤，火星四溅。',
      '淬火池里"嗤"地一声白雾腾起，你手臂震得发麻。',
      '老周掂了掂铁件，粗声道：行，今天这活没白干。',
    ],
    newbieHint: '银两回报最高，但体力消耗也更重。',
    recommendedAttr: '力量/筋骨',
    rollCost: (player) => {
      const str = attr(player, 'strength');
      const vit = attr(player, 'vitality');
      const reduce = Math.floor((str + vit) / 20);
      return {
        hp: 1,
        energy: Math.max(2, 4 - Math.floor(reduce / 2)),
      };
    },
    rollReward: (player) => {
      const str = attr(player, 'strength');
      const vit = attr(player, 'vitality');
      const factor = scoreFactor(str + vit);
      return {
        exp: clampToInt(rollBetween(22, 34) * factor, 1),
        potential: clampToInt(rollBetween(10, 18) * factor, 1),
        silver: clampToInt(rollBetween(18, 30), 1),
      };
    },
  },
];

const WORK_JOB_BY_ID: Record<WorkJobId, WorkJobDefinition> = WORK_JOB_DEFS.reduce(
  (acc, job) => {
    acc[job.id] = job;
    return acc;
  },
  {} as Record<WorkJobId, WorkJobDefinition>,
);

@Injectable()
export class WorkManager {
  private readonly logger = new Logger(WorkManager.name);
  private readonly activeSessions = new Map<string, WorkSession>();

  /** look 动作注入：仅在打工 NPC 显示「打工」，进行中显示「停工」 */
  getNpcAvailableActions(player: PlayerBase, npc: NpcBase): string[] {
    const npcBlueprintId = this.getBlueprintId(npc.id);
    const hasWork = WORK_JOB_DEFS.some((job) => job.npcBlueprintIds.includes(npcBlueprintId));
    if (!hasWork) return [];

    const current = this.activeSessions.get(player.id);
    if (current && current.npcId === npc.id) {
      return ['work', 'workStop'];
    }

    if (current) {
      return [];
    }

    return ['work'];
  }

  openWorkList(player: PlayerBase, npc: NpcBase): CommandResult {
    const npcBlueprintId = this.getBlueprintId(npc.id);
    const jobs = WORK_JOB_DEFS.filter((job) => job.npcBlueprintIds.includes(npcBlueprintId));
    if (jobs.length === 0) {
      return {
        success: false,
        message: `${npc.getName()}摇了摇头：「我这儿没有能派给你的活。」`,
      };
    }

    const newbieReason = this.getNoviceGuardReason(player);
    const offerViews: WorkOfferView[] = jobs.map((job) => {
      const alreadyBusy = this.activeSessions.has(player.id)
        ? '你手头还有活没收尾，先停工再说。'
        : null;
      const reason = newbieReason ?? alreadyBusy;
      return {
        jobId: job.id,
        title: job.title,
        summary: job.summary,
        tags: [...job.tags],
        recommendedAttr: job.recommendedAttr,
        newbieHint: job.newbieHint,
        estimateCost: { ...job.estimateCost },
        estimateReward: { ...job.estimateReward },
        dailyCap: {
          exp: DAILY_EXP_CAP,
          potential: DAILY_POTENTIAL_CAP,
        },
        eligible: !reason,
        reason: reason ?? undefined,
        planOptions: Object.values(WORK_PLANS).map((plan) => ({
          key: plan.key,
          label: plan.label,
          rounds: plan.rounds,
        })),
      };
    });

    const workData = this.getWorkData(player);
    this.refreshDaily(workData);
    this.setWorkData(player, workData);

    return {
      success: true,
      data: {
        action: 'work_list',
        npcId: npc.id,
        npcName: npc.getName(),
        jobs: offerViews,
        dailyProgress: {
          expEarned: workData.daily.expEarned,
          potentialEarned: workData.daily.potentialEarned,
          silverEarned: workData.daily.silverEarned,
          expRemaining: Math.max(0, DAILY_EXP_CAP - workData.daily.expEarned),
          potentialRemaining: Math.max(0, DAILY_POTENTIAL_CAP - workData.daily.potentialEarned),
        },
        active: this.buildActiveSummary(player.id),
      },
    };
  }

  startWork(player: PlayerBase, params: StartWorkParams): CommandResult {
    const { npc, jobId, plan } = params;

    if (player.isInCombat()) {
      return { success: false, message: '你正与人缠斗，哪还有心思打工。' };
    }

    if (this.activeSessions.has(player.id)) {
      return { success: false, message: '你手头还有活没收尾，先停工再说。' };
    }

    const job = WORK_JOB_BY_ID[jobId as WorkJobId];
    if (!job) {
      return { success: false, message: '这份活计在册子上查不到。' };
    }

    const npcBlueprintId = this.getBlueprintId(npc.id);
    if (!job.npcBlueprintIds.includes(npcBlueprintId)) {
      return { success: false, message: `${npc.getName()}皱眉道：「这活不归我发。」` };
    }

    const noviceReason = this.getNoviceGuardReason(player);
    if (noviceReason) {
      return {
        success: false,
        message: `${npc.getName()}摆了摆手：「${noviceReason}」`,
      };
    }

    const parsedPlan = this.parsePlan(plan);
    if (!parsedPlan) {
      return { success: false, message: '打工档位不明，试试 1 / 5 / 20 / auto。' };
    }

    const cost = job.rollCost(player);
    const hp = clampToInt(player.get<number>('hp') ?? 0, 0);
    const energy = clampToInt(player.get<number>('energy') ?? 0, 0);
    if (hp <= cost.hp || energy < cost.energy) {
      return {
        success: false,
        message: `${npc.getName()}看了你一眼：「你脸色发白，先缓一口气再来。」`,
      };
    }

    const session: WorkSession = {
      playerId: player.id,
      npcId: npc.id,
      npcName: npc.getName(),
      npcBlueprintId,
      job,
      plan: parsedPlan.key,
      roundsPlanned: parsedPlan.rounds,
      roundsCompleted: 0,
      gainedExp: 0,
      gainedPotential: 0,
      gainedSilver: 0,
      timer: setInterval(() => this.onWorkTick(player.id), WORK_TICK_MS),
    };

    this.activeSessions.set(player.id, session);

    const planText = parsedPlan.rounds == null ? '持续' : `${parsedPlan.rounds}轮`;
    player.receiveMessage(
      `${rt('npc', npc.getName())}把活计交到你手里：${job.summary}\n` +
        `${rt('sys', `你准备按「${planText}」节奏开工。每轮约消耗：气血 ${job.estimateCost.hp}、精力 ${job.estimateCost.energy}。`)}`,
    );

    return {
      success: true,
      message: `${npc.getName()}点头道：「行，先把手上这份${job.title}做利索。」`,
      data: {
        action: 'work_start',
        jobId: job.id,
        plan: parsedPlan.key,
      },
    };
  }

  stopWork(player: PlayerBase, reason: 'manual' | 'disconnect' | 'combat' | 'left' | 'resource' | 'cap' | 'finished' = 'manual'): CommandResult {
    const session = this.activeSessions.get(player.id);
    if (!session) {
      return { success: false, message: '你当前没有在打工。' };
    }

    this.finishSession(player, session, reason);

    return {
      success: true,
      data: {
        action: 'work_stop',
      },
    };
  }

  isInWork(player: PlayerBase): boolean {
    return this.activeSessions.has(player.id);
  }

  /** 断线清理：静默停工，避免残留定时器 */
  onPlayerDisconnect(player: PlayerBase): void {
    const session = this.activeSessions.get(player.id);
    if (!session) return;
    this.finishSession(player, session, 'disconnect', true);
  }

  private onWorkTick(playerId: string): void {
    const session = this.activeSessions.get(playerId);
    if (!session) return;

    const player = ServiceLocator.objectManager?.findById(playerId);
    if (!(player instanceof PlayerBase) || player.destroyed) {
      this.clearSession(playerId);
      return;
    }

    if (player.isInCombat()) {
      this.finishSession(player, session, 'combat');
      return;
    }

    const npcEntity = ServiceLocator.objectManager?.findById(session.npcId);
    if (!(npcEntity && this.getBlueprintId(npcEntity.id) === session.npcBlueprintId)) {
      this.finishSession(player, session, 'left');
      return;
    }

    if (player.getEnvironment() !== npcEntity.getEnvironment()) {
      this.finishSession(player, session, 'left');
      return;
    }

    const noviceReason = this.getNoviceGuardReason(player);
    if (noviceReason) {
      this.finishSession(player, session, 'finished');
      player.receiveMessage(rt('sys', `你忽觉身手已非昨日，继续做这等杂活已无益处。`));
      return;
    }

    const workData = this.getWorkData(player);
    this.refreshDaily(workData);

    const cost = session.job.rollCost(player);
    const hp = clampToInt(player.get<number>('hp') ?? 0, 0);
    const energy = clampToInt(player.get<number>('energy') ?? 0, 0);

    if (hp <= cost.hp || energy < cost.energy) {
      this.setWorkData(player, workData);
      this.finishSession(player, session, 'resource');
      return;
    }

    player.set('hp', hp - cost.hp);
    player.set('energy', energy - cost.energy);

    const rolled = session.job.rollReward(player);
    const expRemaining = Math.max(0, DAILY_EXP_CAP - workData.daily.expEarned);
    const potentialRemaining = Math.max(0, DAILY_POTENTIAL_CAP - workData.daily.potentialEarned);

    const gainedExp = Math.min(rolled.exp, expRemaining);
    const gainedPotential = Math.min(rolled.potential, potentialRemaining);
    const gainedSilver = rolled.silver;

    if (gainedExp <= 0 && gainedPotential <= 0) {
      this.setWorkData(player, workData);
      this.finishSession(player, session, 'cap');
      return;
    }

    if (gainedExp > 0) {
      if (ServiceLocator.expManager) {
        ServiceLocator.expManager.gainCombatExp(player, gainedExp);
      } else {
        const current = clampToInt(player.get<number>('exp') ?? 0, 0);
        const next = current + gainedExp;
        player.set('exp', next);
        player.set('combat_exp', next);
      }
    }

    if (gainedPotential > 0) {
      const currentPotential = clampToInt(player.get<number>('potential') ?? 0, 0);
      player.set('potential', currentPotential + gainedPotential);
    }

    if (gainedSilver > 0) {
      player.addSilver(gainedSilver);
    }

    session.roundsCompleted += 1;
    session.gainedExp += gainedExp;
    session.gainedPotential += gainedPotential;
    session.gainedSilver += gainedSilver;

    workData.daily.expEarned += gainedExp;
    workData.daily.potentialEarned += gainedPotential;
    workData.daily.silverEarned += gainedSilver;
    workData.daily.cycles += 1;
    workData.history[session.job.id] = clampToInt(workData.history[session.job.id] ?? 0, 0) + 1;
    this.setWorkData(player, workData);

    const flavor = session.job.roleplayLines[(session.roundsCompleted - 1) % session.job.roleplayLines.length];
    const summary = `${rt('sys', `本轮所得：经验 ${gainedExp}，潜能 ${gainedPotential}，银两 ${gainedSilver}。`)}`;
    const remaining = `${rt('sys', `今日剩余：经验 ${Math.max(0, DAILY_EXP_CAP - workData.daily.expEarned)}，潜能 ${Math.max(0, DAILY_POTENTIAL_CAP - workData.daily.potentialEarned)}。`)}`;
    player.receiveMessage(`${rt('npc', session.npcName)}${flavor}\n${summary}\n${remaining}`);

    if (session.roundsPlanned != null && session.roundsCompleted >= session.roundsPlanned) {
      this.finishSession(player, session, 'finished');
      return;
    }

    if (workData.daily.expEarned >= DAILY_EXP_CAP && workData.daily.potentialEarned >= DAILY_POTENTIAL_CAP) {
      this.finishSession(player, session, 'cap');
    }
  }

  private finishSession(
    player: PlayerBase,
    session: WorkSession,
    reason: 'manual' | 'disconnect' | 'combat' | 'left' | 'resource' | 'cap' | 'finished',
    silent = false,
  ): void {
    this.clearSession(player.id);

    if (silent) return;

    const reasonText = this.getStopReasonText(reason);
    const summary = `${rt('sys', `共完成 ${session.roundsCompleted} 轮，经验 +${session.gainedExp}，潜能 +${session.gainedPotential}，银两 +${session.gainedSilver}。`)}`;

    if (reason === 'manual') {
      player.receiveMessage(`${rt('npc', session.npcName)}看你收手不做，只嗯了一声。\n${summary}`);
      return;
    }

    player.receiveMessage(`${rt('sys', reasonText)}\n${summary}`);
  }

  private getStopReasonText(
    reason: 'manual' | 'disconnect' | 'combat' | 'left' | 'resource' | 'cap' | 'finished',
  ): string {
    switch (reason) {
      case 'disconnect':
        return '你与岗位的联系断开，手头活计自然停了下来。';
      case 'combat':
        return '你被战事牵扯，手头活计被迫中断。';
      case 'left':
        return '你离开了工位，活计只得暂且搁下。';
      case 'resource':
        return '你一阵眼花气短，体力不继，只能先歇工。';
      case 'cap':
        return '今日从杂役里能榨出的心得已到极限，再做也难有寸进。';
      case 'finished':
        return '你把这趟活计收了尾，抖了抖衣袖，长出一口气。';
      case 'manual':
      default:
        return '你停下了手中的活计。';
    }
  }

  private clearSession(playerId: string): void {
    const session = this.activeSessions.get(playerId);
    if (!session) return;
    clearInterval(session.timer);
    this.activeSessions.delete(playerId);
  }

  private getWorkData(player: PlayerBase): PlayerWorkData {
    const raw = player.get<PlayerWorkData>('work') ?? EMPTY_PLAYER_WORK_DATA;
    return normalizePlayerWorkData(raw);
  }

  private setWorkData(player: PlayerBase, data: PlayerWorkData): void {
    player.set('work', clonePlayerWorkData(data));
  }

  private refreshDaily(data: PlayerWorkData): void {
    const key = todayKey();
    if (data.daily.dateKey === key) return;

    data.daily = {
      dateKey: key,
      expEarned: 0,
      potentialEarned: 0,
      silverEarned: 0,
      cycles: 0,
    };
  }

  private parsePlan(raw: string): { key: WorkPlanKey; rounds: number | null } | null {
    const token = (raw ?? '').trim().toLowerCase();
    if (!token) return null;

    if (token === '1' || token === 'once' || token === 'one') {
      return { key: WORK_PLANS.once.key, rounds: WORK_PLANS.once.rounds };
    }
    if (token === '5' || token === 'short') {
      return { key: WORK_PLANS.short.key, rounds: WORK_PLANS.short.rounds };
    }
    if (token === '20' || token === 'medium') {
      return { key: WORK_PLANS.medium.key, rounds: WORK_PLANS.medium.rounds };
    }
    if (token === 'auto' || token === '持续' || token === 'continuous') {
      return { key: WORK_PLANS.auto.key, rounds: WORK_PLANS.auto.rounds };
    }

    return null;
  }

  private getNoviceGuardReason(player: PlayerBase): string | null {
    const level = clampToInt(player.get<number>('level') ?? 1, 1);
    const exp = clampToInt(player.get<number>('exp') ?? player.get<number>('combat_exp') ?? 0, 0);
    const score = clampToInt(player.get<number>('score') ?? 0, 0);

    if (level > NEWBIE_MAX_LEVEL || exp > NEWBIE_MAX_EXP || score > NEWBIE_MAX_SCORE) {
      return '你已不是新手，该去更大的江湖磨砺了。';
    }

    return null;
  }

  private buildActiveSummary(playerId: string):
    | {
        jobId: WorkJobId;
        title: string;
        plan: WorkPlanKey;
        roundsPlanned: number | null;
        roundsCompleted: number;
      }
    | undefined {
    const session = this.activeSessions.get(playerId);
    if (!session) return undefined;

    return {
      jobId: session.job.id,
      title: session.job.title,
      plan: session.plan,
      roundsPlanned: session.roundsPlanned,
      roundsCompleted: session.roundsCompleted,
    };
  }

  private getBlueprintId(entityId: string): string {
    return entityId.split('#')[0];
  }
}
