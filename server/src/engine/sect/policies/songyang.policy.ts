/**
 * 嵩阳宗门规策略
 */
import { Injectable } from '@nestjs/common';
import type { ItemBase } from '../../game-objects/item-base';
import type { LivingBase } from '../../game-objects/living-base';
import type { NpcBase } from '../../game-objects/npc-base';
import type { PlayerBase } from '../../game-objects/player-base';
import type { PlayerSectData } from '../types';
import type {
  SectPolicy,
  SectDonationEvaluation,
  SectSparReward,
  SectBetrayPenalty,
  SectRankThreshold,
} from './sect-policy';

@Injectable()
export class SongyangPolicy implements SectPolicy {
  readonly sectId = 'songyang';
  readonly sectName = '嵩阳宗';
  readonly factionRequired = 'songyang';

  readonly ranks: SectRankThreshold[] = [
    { rank: '外门弟子', minContribution: 0 },
    { rank: '内门弟子', minContribution: 300 },
    { rank: '执事弟子', minContribution: 1200 },
    { rank: '亲传弟子', minContribution: 3000 },
    { rank: '护法弟子', minContribution: 8000 },
  ];

  canApprentice(player: PlayerBase, _master: NpcBase, _data: PlayerSectData): true | string {
    const level = player.get<number>('level') ?? 1;
    if (level < 3) {
      return '你火候未足，先在江湖历练几番，再来叩门。';
    }
    return true;
  }

  evaluateDonation(_player: PlayerBase, _deacon: NpcBase, item: ItemBase): SectDonationEvaluation {
    if (item.getType() === 'quest') {
      return {
        allowed: false,
        contribution: 0,
        reason: '门规在前：任务信物不得充作门中公物。',
      };
    }

    const value = Math.max(0, Math.floor(item.getValue() || 0));
    const weight = Math.max(0, Math.floor(item.getWeight() || 0));
    if (value <= 0 && weight <= 0) {
      return {
        allowed: false,
        contribution: 0,
        reason: '此物太轻，不足以入账。你且换件像样的来。',
      };
    }

    const contribution = Math.max(1, Math.floor(value * 0.6 + weight * 0.2));
    return {
      allowed: true,
      contribution,
    };
  }

  resolveRankByContribution(contribution: number): string {
    const value = Math.max(0, Math.floor(contribution));
    let rank = this.ranks[0].rank;
    for (const item of this.ranks) {
      if (value >= item.minContribution) {
        rank = item.rank;
      }
    }
    return rank;
  }

  resolveSparReward(_player: PlayerBase, _opponent: LivingBase, victory: boolean): SectSparReward {
    const contribution = victory ? 120 : 60;
    return {
      contribution,
      summary: victory
        ? '你在演武中稳住架势，赢得满场喝彩。'
        : '你虽落下风，仍守住了门中章法。',
    };
  }

  applyBetrayalPenalty(_player: PlayerBase, _witness: NpcBase, _data: PlayerSectData): SectBetrayPenalty {
    return {
      removeFactionSkills: true,
      banForever: true,
      clearContribution: true,
      clearRank: true,
      summary: '你已自绝门墙，嵩阳宗自此不再收录。',
    };
  }
}
