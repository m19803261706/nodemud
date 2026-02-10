/**
 * RegenerateEffect — 提振精神
 *
 * 通用瞬发效果：消耗内力恢复精力。
 * 非战斗专用，内力不足时按比例部分恢复。
 *
 * 对标: LPC exert regenerate
 */
import { ExertEffect, ExertEffectBase, type ExertExecuteResult } from '../exert-effect-base';
import type { PlayerBase } from '../../game-objects/player-base';
import { rt, bold } from '@packages/core';

@ExertEffect()
export class RegenerateEffect extends ExertEffectBase {
  readonly name = 'regenerate';
  readonly displayName = '提振精神';
  readonly isUniversal = true;
  readonly canUseInCombat = false;

  execute(player: PlayerBase, forceSkillId: string, forceLevel: number): ExertExecuteResult {
    const mp = player.get<number>('mp') ?? 0;
    const energy = player.get<number>('energy') ?? 0;
    const maxEnergy = player.getMaxEnergy();
    const missing = maxEnergy !== undefined ? maxEnergy - energy : 0;

    // 前置检查：内力 >= 20
    if (mp < 20) {
      return {
        success: false,
        message: rt('sys', '你的内力不足，无法提振精神。'),
        resourceChanged: false,
      };
    }

    // 前置检查：精力缺失 >= 10
    if (missing < 10) {
      return {
        success: false,
        message: rt('sys', '你精力充沛，无需提振精神。'),
        resourceChanged: false,
      };
    }

    // 消耗公式: cost = max(20, floor(缺失精力 * 60 / forceLevel))
    const cost = Math.max(20, Math.floor((missing * 60) / forceLevel));

    // 实际消耗 = min(cost, 当前内力)
    const actualCost = Math.min(cost, mp);
    // 按比例恢复精力
    const recoverAmount = Math.floor((missing * actualCost) / cost);

    // 扣除内力
    player.set('mp', mp - actualCost);
    // 恢复精力
    const actualRecover = player.recoverEnergy(recoverAmount);

    const message = rt(
      'sys',
      `你提振精神，消耗 ${bold(String(actualCost))} 点内力，恢复了 ${bold(String(actualRecover))} 点精力。`,
    );

    return {
      success: true,
      message,
      resourceChanged: true,
    };
  }

  getDescription(): string {
    return '消耗内力恢复精力，非战斗使用';
  }
}
