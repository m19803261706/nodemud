/**
 * PowerupEffect — 强化
 *
 * 特殊 buff 效果：消耗内力获得临时攻击/闪避/格挡加成。
 * 需要内功的 getExertEffects() 声明支持才能使用。
 * 使用 tmpDbase 存储 buff 状态，callOut 到期自动移除。
 *
 * 对标: LPC exert powerup
 */
import { ExertEffect, ExertEffectBase, type ExertExecuteResult } from '../exert-effect-base';
import type { PlayerBase } from '../../game-objects/player-base';
import { MessageFactory, rt, bold } from '@packages/core';

@ExertEffect()
export class PowerupEffect extends ExertEffectBase {
  readonly name = 'powerup';
  readonly displayName = '强化';
  readonly isUniversal = false;
  readonly canUseInCombat = false;

  execute(player: PlayerBase, forceSkillId: string, forceLevel: number): ExertExecuteResult {
    const mp = player.get<number>('mp') ?? 0;

    // 前置检查：内力 >= 150
    if (mp < 150) {
      return {
        success: false,
        message: rt('sys', '你的内力不足，无法施展强化。'),
        resourceChanged: false,
      };
    }

    // 前置检查：内功等级 >= 40
    if (forceLevel < 40) {
      return {
        success: false,
        message: rt('sys', '你的内功修为不够，无法施展强化。'),
        resourceChanged: false,
      };
    }

    const bonus = Math.floor((forceLevel * 2) / 5);
    const duration = forceLevel; // 秒

    // 消耗 150 内力
    player.set('mp', mp - 150);

    // 重复使用：移除旧 callOut
    const oldCallOutId = player.getTemp<string>('exert/powerup_callout');
    if (oldCallOutId) {
      player.removeCallOut(oldCallOutId);
    }

    // 设置 buff
    player.setTemp('exert/powerup', { attack: bonus, dodge: bonus, parry: bonus });

    // callOut 到期移除
    const callOutId = player.callOut(() => {
      player.delTemp('exert/powerup');
      player.delTemp('exert/powerup_callout');
      // 推送 buffRemoved 消息
      const removeMsg = MessageFactory.create('exertResult', {
        effectName: 'powerup',
        displayName: '强化',
        success: true,
        message: rt('sys', '强化之力逐渐消散。'),
        resourceChanged: false,
        buffRemoved: 'powerup',
      });
      if (removeMsg) {
        player.sendToClient(MessageFactory.serialize(removeMsg));
      }
    }, duration * 1000);

    player.setTemp('exert/powerup_callout', callOutId);

    return {
      success: true,
      message: rt(
        'sys',
        `你运起内力强化自身，攻击/闪避/格挡各提升 ${bold(String(bonus))} 点，持续 ${bold(String(duration))} 秒。`,
      ),
      resourceChanged: true,
      buffApplied: {
        name: 'powerup',
        duration,
        bonuses: { attack: bonus, dodge: bonus, parry: bonus },
      },
    };
  }

  getDescription(): string {
    return '消耗内力获得临时攻击/闪避/格挡加成，需内功等级 40+';
  }
}
