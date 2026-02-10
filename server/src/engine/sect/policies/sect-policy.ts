/**
 * 门派策略接口
 * 每个门派可自定义拜师、捐献、演武与叛门惩罚规则。
 */
import type { ItemBase } from '../../game-objects/item-base';
import type { LivingBase } from '../../game-objects/living-base';
import type { NpcBase } from '../../game-objects/npc-base';
import type { PlayerBase } from '../../game-objects/player-base';
import type { PlayerSectData } from '../types';

export interface SectRankThreshold {
  rank: string;
  minContribution: number;
}

export interface SectDonationEvaluation {
  allowed: boolean;
  contribution: number;
  reason?: string;
}

export interface SectSparReward {
  contribution: number;
  summary: string;
}

export interface SectBetrayPenalty {
  removeFactionSkills: boolean;
  banForever: boolean;
  clearContribution: boolean;
  clearRank: boolean;
  /** 预留：转投冷却（毫秒） */
  cooldownMs?: number;
  summary?: string;
}

export interface SectPolicy {
  readonly sectId: string;
  readonly sectName: string;
  readonly factionRequired: string;
  readonly ranks: SectRankThreshold[];

  canApprentice(player: PlayerBase, master: NpcBase, data: PlayerSectData): true | string;

  evaluateDonation(player: PlayerBase, deacon: NpcBase, item: ItemBase): SectDonationEvaluation;

  resolveRankByContribution(contribution: number): string;

  resolveSparReward(player: PlayerBase, opponent: LivingBase, victory: boolean): SectSparReward;

  applyBetrayalPenalty(player: PlayerBase, witness: NpcBase, data: PlayerSectData): SectBetrayPenalty;
}
