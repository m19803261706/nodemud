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
import { COMBAT_CONSTANTS, SKILL_CONSTANTS } from '@packages/core';
import type { LivingBase } from '../game-objects/living-base';
import type { SkillAction } from '../skills/types';

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

/** 招式攻击选项 */
export interface SkillAttackOptions {
  /** 使用的招式（undefined 则为普通攻击） */
  action?: SkillAction;
  /** 武器是否不匹配（兵刃武学装备了错误类型武器） */
  weaponMismatch?: boolean;
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

    const defenderMaxHp = defender.getMaxHp();
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
   * 带招式修正的攻击计算
   * 在基础伤害公式上叠加招式的 modifiers 和武器匹配检查
   *
   * @param attacker 攻击方
   * @param defender 防御方
   * @param options  招式选项（action 和武器匹配标记）
   * @returns 攻击结果
   */
  static calculateWithAction(
    attacker: LivingBase,
    defender: LivingBase,
    options?: SkillAttackOptions,
  ): AttackResult {
    const action = options?.action;
    const weaponMismatch = options?.weaponMismatch ?? false;

    // 无招式时退化为普通攻击
    if (!action) {
      return this.calculate(attacker, defender);
    }

    // 叠加招式攻击修正
    const baseAttack = attacker.getAttack();
    const effectiveAttack = baseAttack + (action.modifiers.attack ?? 0);
    const defense = defender.getDefense();

    const isCrit = false;

    // 使用修正后的攻击力计算基础伤害
    let damage = this.calculateDamage(effectiveAttack, defense);

    // 叠加招式伤害修正
    damage += action.modifiers.damage ?? 0;

    // 武器不匹配惩罚
    if (weaponMismatch) {
      damage = Math.floor(damage * SKILL_CONSTANTS.WEAPON_MISMATCH_FACTOR);
    }

    // 保底伤害
    damage = Math.max(COMBAT_CONSTANTS.MIN_DAMAGE, damage);

    const description = this.generateSkillDescription(
      attacker,
      defender,
      action,
      damage,
      isCrit,
      weaponMismatch,
    );

    return {
      type: isCrit ? 'crit' : 'attack',
      damage,
      isCrit,
      description,
    };
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

  /**
   * 生成招式攻击描述（富文本）
   * 显示招式名称和伤害信息
   *
   * @param attacker      攻击方
   * @param defender      防御方
   * @param action        使用的招式
   * @param damage        伤害值
   * @param _isCrit       是否暴击
   * @param weaponMismatch 是否武器不匹配
   * @returns 富文本战斗描述
   */
  private static generateSkillDescription(
    attacker: LivingBase,
    defender: LivingBase,
    action: SkillAction,
    damage: number,
    _isCrit: boolean,
    weaponMismatch: boolean,
  ): string {
    const attackerName = attacker.getName();
    const defenderName = defender.getName();

    let desc =
      `[combat]${attackerName}[/combat]使出「${action.name}」攻击` +
      `[combat]${defenderName}[/combat]，` +
      `造成 [damage]${damage}[/damage] 点伤害。`;

    if (weaponMismatch) {
      desc += '（武器不合，威力大减）';
    }

    return desc;
  }
}
