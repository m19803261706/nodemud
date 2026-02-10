/**
 * 技能系统内部类型定义
 * 仅后端使用的接口，不通过 @packages/core 暴露给前端
 */

/**
 * 技能招式定义
 * 每个武学/内功可以拥有多个招式，按等级解锁
 */
export interface SkillAction {
  /** 招式名称，如 '怀中抱月' */
  name: string;
  /** 招式描述 */
  description: string;
  /** 解锁等级 */
  lvl: number;
  /** 消耗资源列表 */
  costs: ResourceCost[];
  /** 战斗属性修正 */
  modifiers: {
    /** 命中修正 */
    attack: number;
    /** 伤害修正 */
    damage: number;
    /** 闪避修正 */
    dodge: number;
    /** 招架修正 */
    parry: number;
    /** 伤害类型 */
    damageType: string;
  };
}

/**
 * 资源消耗定义
 * 招式或修炼消耗的资源
 */
export interface ResourceCost {
  /** 资源类型：'mp' | 'energy' | 'hp' */
  resource: string;
  /** 消耗数量 */
  amount: number;
}

/**
 * 角色属性部分接口
 * 用于 InternalSkillBase.getAttributeBonus 返回值
 */
export interface CharacterAttrs {
  /** 力量 */
  strength: number;
  /** 体质 */
  vitality: number;
  /** 敏捷 */
  perception: number;
  /** 灵性 */
  spirit: number;
  /** 根骨 */
  wisdom: number;
  /** 经脉 */
  meridian: number;
}
