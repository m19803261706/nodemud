/**
 * exert 指令 -- 运功
 *
 * 使用内力施展特殊效果：
 *   exert              -- 列出可用运功效果
 *   exert <效果名>     -- 执行指定运功效果
 *   exert stop         -- 中断持续运功（如疗伤）
 *
 * 通用效果（recover/heal/regenerate）所有内功共享；
 * 特殊效果（shield/powerup）需内功 getExertEffects() 声明支持。
 *
 * 对标: LPC exert / 炎黄 yunggong_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { PlayerBase } from '../../game-objects/player-base';
import { MessageFactory, rt, bold } from '@packages/core';
import { ExertEffectRegistry } from '../../exert/exert-effect-registry';
import type { InternalSkillBase } from '../../skills/internal/internal-skill-base';

// 显式导入效果文件确保装饰器执行
import '../../exert/effects/recover';
import '../../exert/effects/heal';
import '../../exert/effects/regenerate';
import '../../exert/effects/shield';
import '../../exert/effects/powerup';

@Command({
  name: 'exert',
  aliases: ['运功', 'yunggong'],
  description: '运功 — 使用内力施展特殊效果',
})
export class ExertCommand implements ICommand {
  name = 'exert';
  aliases = ['运功', 'yunggong'];
  description = '运功 — 使用内力施展特殊效果';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    // 1. 类型守卫
    if (!(executor instanceof PlayerBase)) {
      return { success: false, message: '只有玩家才能运功。' };
    }

    const player = executor;
    const skillManager = player.skillManager;
    if (!skillManager) {
      return { success: false, message: '技能系统尚未初始化。' };
    }

    // 2. 获取激活内功
    const forceId = skillManager.getActiveForce();
    if (!forceId) {
      return { success: false, message: rt('sys', '你没有激活内功，无法运功。') };
    }

    // 3. 获取内功等级
    const forceLevel = skillManager.getSkillLevel(forceId);

    // 4. 获取内功定义（用于特殊效果检查）
    const forceDef = this.getForceDefinition(skillManager, forceId);

    const registry = ExertEffectRegistry.getInstance();

    // 5. 无参数：列出可用效果
    if (args.length === 0) {
      return this.listEffects(registry, forceDef);
    }

    const effectName = args[0].toLowerCase();

    // 6. stop 子命令：中断持续运功
    if (effectName === 'stop' || effectName === '停止') {
      return this.handleStop(player);
    }

    // 7. 查找效果
    const effect = registry.get(effectName);
    if (!effect) {
      return {
        success: false,
        message: rt('sys', `未知的运功效果「${effectName}」。输入 ${bold('exert')} 查看可用效果。`),
      };
    }

    // 8. 特殊效果检查 getExertEffects()
    if (!effect.isUniversal) {
      const supportedEffects = forceDef?.getExertEffects() ?? [];
      if (!supportedEffects.includes(effect.name)) {
        return {
          success: false,
          message: rt('sys', `你当前的内功不支持「${effect.displayName}」。`),
        };
      }
    }

    // 9. 战斗限制
    if (!effect.canUseInCombat && player.isInCombat()) {
      return {
        success: false,
        message: rt('sys', `「${effect.displayName}」不能在战斗中使用。`),
      };
    }

    // 10. 执行效果
    const result = effect.execute(player, forceId, forceLevel, args[1]);

    // 11. 推送 exertResult 消息
    const msg = MessageFactory.create('exertResult', {
      effectName: effect.name,
      displayName: effect.displayName,
      ...result,
    });
    if (msg) {
      player.sendToClient(MessageFactory.serialize(msg));
    }

    // 12. 成功后概率提升内功
    if (result.success) {
      const improveChance = Math.max(1, 10 - Math.floor(forceLevel / 50));
      if (Math.random() * 100 < improveChance) {
        skillManager.improveSkill(forceId, 1, true); // weakMode
      }
    }

    return {
      success: result.success,
      message: result.message,
    };
  }

  /** 列出可用运功效果 */
  private listEffects(
    registry: ExertEffectRegistry,
    forceDef: InternalSkillBase | null,
  ): CommandResult {
    const universals = registry.getUniversal();
    const supportedSpecials = forceDef?.getExertEffects() ?? [];

    const lines: string[] = [rt('sys', bold('可用运功效果：'))];

    // 通用效果
    for (const e of universals) {
      lines.push(
        `  ${rt('imp', bold(e.name))} (${e.displayName}) — ${e.getDescription()}`,
      );
    }

    // 当前内功支持的特殊效果
    if (supportedSpecials.length > 0) {
      const allEffects = registry.getAll();
      for (const name of supportedSpecials) {
        const e = allEffects.find((ef) => ef.name === name);
        if (e && !e.isUniversal) {
          lines.push(
            `  ${rt('imp', bold(e.name))} (${e.displayName}) — ${e.getDescription()}`,
          );
        }
      }
    }

    lines.push('');
    lines.push(rt('sys', `用法: ${bold('exert <效果名>')} 或 ${bold('exert stop')} 中断`));

    return {
      success: true,
      message: lines.join('\n'),
    };
  }

  /** 处理 exert stop */
  private handleStop(player: PlayerBase): CommandResult {
    if (!player.getTemp<boolean>('exert/healing')) {
      return {
        success: false,
        message: rt('sys', '你当前没有在运功。'),
      };
    }

    // 清除疗伤状态（heal tick 下次检查时自然停止）
    player.delTemp('exert/healing');

    // 推送停止消息
    const stopMsg = MessageFactory.create('exertResult', {
      effectName: 'heal',
      displayName: '运功疗伤',
      success: true,
      message: rt('sys', '你主动收功，运功疗伤结束。'),
      resourceChanged: true,
      healingStopped: true,
    });
    if (stopMsg) {
      player.sendToClient(MessageFactory.serialize(stopMsg));
    }

    return {
      success: true,
      message: rt('sys', '你主动收功，运功疗伤结束。'),
    };
  }

  /** 获取内功定义（安全类型转换） */
  private getForceDefinition(
    skillManager: any,
    forceId: string,
  ): InternalSkillBase | null {
    try {
      const skillRegistry = skillManager.skillRegistry ?? skillManager['skillRegistry'];
      if (!skillRegistry) return null;
      const def = skillRegistry.get(forceId);
      if (def && typeof def.getExertEffects === 'function') {
        return def as InternalSkillBase;
      }
      return null;
    } catch {
      return null;
    }
  }
}
