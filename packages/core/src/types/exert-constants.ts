/**
 * 运功效果枚举与元信息常量
 * 定义运功系统的 5 种效果类型及其基础属性
 */

/** 运功效果类型（5 种） */
export enum ExertEffectType {
  /** 调匀气息 — 消耗内力恢复气血 */
  RECOVER = 'recover',
  /** 运功疗伤 — 持续消耗内力恢复气血 */
  HEAL = 'heal',
  /** 提振精神 — 消耗内力恢复精力 */
  REGENERATE = 'regenerate',
  /** 护体 — 消耗内力获得临时防御加成 */
  SHIELD = 'shield',
  /** 强化 — 消耗内力获得临时攻击/闪避/格挡加成 */
  POWERUP = 'powerup',
}

/** 运功效果元信息 */
export const EXERT_EFFECT_META: Record<
  ExertEffectType,
  {
    displayName: string;
    isUniversal: boolean;
    canUseInCombat: boolean;
  }
> = {
  [ExertEffectType.RECOVER]: { displayName: '调匀气息', isUniversal: true, canUseInCombat: true },
  [ExertEffectType.HEAL]: { displayName: '运功疗伤', isUniversal: true, canUseInCombat: false },
  [ExertEffectType.REGENERATE]: {
    displayName: '提振精神',
    isUniversal: true,
    canUseInCombat: false,
  },
  [ExertEffectType.SHIELD]: { displayName: '护体', isUniversal: false, canUseInCombat: false },
  [ExertEffectType.POWERUP]: { displayName: '强化', isUniversal: false, canUseInCombat: false },
};
