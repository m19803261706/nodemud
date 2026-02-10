/**
 * RecoverEffect — 调匀气息
 *
 * 通用瞬发效果：消耗内力恢复气血。
 * 战斗中可用，但消耗翻倍。内力不足时按比例部分恢复。
 *
 * 对标: LPC exert recover
 */
import { ExertEffect, ExertEffectBase, type ExertExecuteResult } from '../exert-effect-base';
import type { PlayerBase } from '../../game-objects/player-base';
import { rt, bold } from '@packages/core';

@ExertEffect()
export class RecoverEffect extends ExertEffectBase {
  readonly name = 'recover';
  readonly displayName = '调匀气息';
  readonly isUniversal = true;
  readonly canUseInCombat = true;

  execute(player: PlayerBase, forceSkillId: string, forceLevel: number): ExertExecuteResult {
    const mp = player.get<number>('mp') ?? 0;
    const hp = player.get<number>('hp') ?? 0;
    const maxHp = player.getMaxHp();
    const missing = maxHp - hp;

    // 前置检查：内力 >= 20
    if (mp < 20) {
      return {
        success: false,
        message: rt('sys', '你的内力不足，无法调匀气息。'),
        resourceChanged: false,
      };
    }

    // 前置检查：气血缺失 >= 10
    if (missing < 10) {
      return {
        success: false,
        message: rt('sys', '你的气血充沛，无需调匀气息。'),
        resourceChanged: false,
      };
    }

    // 消耗公式: cost = max(20, floor(100 * missing / forceLevel))
    let cost = Math.max(20, Math.floor((100 * missing) / forceLevel));

    // 战斗中消耗翻倍
    if (player.isInCombat()) {
      cost *= 2;
    }

    // 实际消耗 = min(cost, 当前内力)
    const actualCost = Math.min(cost, mp);
    // 按比例恢复: healAmount = floor(missing * actualCost / cost)
    const healAmount = Math.floor((missing * actualCost) / cost);

    // 扣除内力
    player.set('mp', mp - actualCost);
    // 恢复气血
    const actualHeal = player.recoverHp(healAmount);

    const message = rt(
      'sys',
      `你调匀气息，消耗 ${bold(String(actualCost))} 点内力，恢复了 ${bold(String(actualHeal))} 点气血。`,
    );

    return {
      success: true,
      message,
      resourceChanged: true,
    };
  }

  getDescription(): string {
    return '消耗内力恢复气血，战斗中消耗翻倍';
  }
}
