/**
 * DamageEngine -- 伤害计算引擎
 *
 * 静态工具类，提供战斗中的攻击、命中、暴击和伤害计算。
 * Phase 0: 命中率 100%、暴击率 0%，仅实现基础伤害公式。
 * Phase 1 预留: rollHit / rollCrit 可启用完整判定链。
 *
 * 伤害公式（PRD R2）:
 *   攻 >= 防: 实际伤害 = baseDamage * 2 - defense
 *   攻 <  防: 实际伤害 = baseDamage^2 / defense
 *   baseDamage = attack * randomFactor(0.8~1.2)
 *   最终伤害 >= COMBAT_CONSTANTS.MIN_DAMAGE
 */
import { COMBAT_CONSTANTS } from '@packages/core';
import type { LivingBase } from '../game-objects/living-base';

/** 单次攻击结果 */
export interface AttackResult {
  /** 攻击类型 */
  type: 'attack' | 'crit' | 'miss' | 'flee_fail';
  /** 最终伤害值 */
  damage: number;
  /** 是否暴击 */
  isCrit: boolean;
  /** 富文本战斗描述 */
  description: string;
}

/**
 * 伤害计算引擎
 * 提供战斗中的攻击、命中、暴击和伤害计算
 */
export class DamageEngine {
  /**
   * 计算一次攻击的完整结果
   * @param attacker 攻击方（LivingBase）
   * @param defender 防御方（LivingBase）
   * @returns 攻击结果，包含伤害值、类型和战斗描述
   */
  static calculate(attacker: LivingBase, defender: LivingBase): AttackResult {
    // Phase 0: 跳过命中判定，始终命中
    // Phase 1 预留: if (!this.rollHit(attacker, defender)) return miss result

    const attack = attacker.getAttack();
    const defense = defender.getDefense();

    // Phase 0: 跳过暴击判定
    const isCrit = false;
    // Phase 1 预留: const isCrit = this.rollCrit(attacker);

    let damage = this.calculateDamage(attack, defense);

    // Phase 1: 暴击伤害 x1.5
    // if (isCrit) damage = Math.floor(damage * 1.5);

    const defenderMaxHp = defender.get<number>('max_hp') || 100;
    const description = this.generateDescription(attacker, defender, damage, isCrit, defenderMaxHp);

    return {
      type: isCrit ? 'crit' : 'attack',
      damage,
      isCrit,
      description,
    };
  }

  /**
   * 伤害公式（PRD R2）
   *
   * baseDamage = attack * randomFactor(0.8~1.2)
   * 攻 >= 防: actualDamage = baseDamage * 2 - defense
   * 攻 <  防: actualDamage = baseDamage^2 / defense
   *
   * @param attack  攻击方攻击力
   * @param defense 防御方防御力
   * @returns 最终伤害（至少 MIN_DAMAGE）
   */
  private static calculateDamage(attack: number, defense: number): number {
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8~1.2
    const baseDamage = attack * randomFactor;

    let actualDamage: number;
    if (attack >= defense) {
      // 攻高于防：伤害优势公式
      actualDamage = baseDamage * 2 - defense;
    } else {
      // 攻低于防：伤害衰减公式
      actualDamage = (baseDamage * baseDamage) / defense;
    }

    return Math.max(COMBAT_CONSTANTS.MIN_DAMAGE, Math.floor(actualDamage));
  }

  /**
   * 命中判定（Phase 1）
   * 命中率 = 85% + (攻方 perception - 守方 perception) * 1%
   * 范围: [50%, 99%]
   */
  private static rollHit(_attacker: LivingBase, _defender: LivingBase): boolean {
    // Phase 0: 始终命中
    return true;
  }

  /**
   * 暴击判定（Phase 1）
   * 暴击率 = 5% + spirit * 0.3%
   */
  private static rollCrit(_attacker: LivingBase): boolean {
    // Phase 0: 不暴击
    return false;
  }

  /**
   * 生成战斗描述（富文本）
   * 使用 SemanticTag 格式：[combat]...[/combat]、[damage]...[/damage]
   *
   * @param attacker      攻击方
   * @param defender      防御方
   * @param damage        伤害值
   * @param _isCrit       是否暴击（Phase 1 启用）
   * @param _defenderMaxHp 防御方最大 HP（Phase 1 用于描述强度词）
   * @returns 富文本战斗描述
   */
  private static generateDescription(
    attacker: LivingBase,
    defender: LivingBase,
    damage: number,
    _isCrit: boolean,
    _defenderMaxHp: number,
  ): string {
    const attackerName = attacker.getName();
    const defenderName = defender.getName();

    // Phase 0: 简单描述
    // Phase 1 预留: 根据 damage/defenderMaxHp 比例选择不同强度词
    return (
      `[combat]${attackerName}[/combat]攻击了` +
      `[combat]${defenderName}[/combat]，` +
      `造成 [damage]${damage}[/damage] 点伤害。`
    );
  }
}
