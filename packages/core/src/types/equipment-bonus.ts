/**
 * 装备属性加成类型定义
 * 定义装备对角色属性的加成结构，以及蓝图扁平数据到结构化数据的转换
 */

import type { CharacterAttrs } from './messages/playerStats';

/** 装备属性加成（单件或汇总） */
export interface EquipmentBonus {
  /** 六维属性加成 */
  attrs?: Partial<CharacterAttrs>;
  /** 三维资源上限加成 */
  resources?: {
    maxHp?: number;
    maxMp?: number;
    maxEnergy?: number;
  };
  /** 攻防数值 */
  combat?: {
    attack?: number;
    defense?: number;
  };
}

/** 六维属性 key 集合 */
const ATTR_KEYS = new Set<string>([
  'wisdom', 'perception', 'spirit', 'meridian', 'strength', 'vitality',
]);

/** 三维资源 key 映射 */
const RESOURCE_KEYS: Record<string, keyof NonNullable<EquipmentBonus['resources']>> = {
  maxHp: 'maxHp',
  maxMp: 'maxMp',
  maxEnergy: 'maxEnergy',
};

/** 攻防 key 映射 */
const COMBAT_KEYS: Record<string, keyof NonNullable<EquipmentBonus['combat']>> = {
  attack: 'attack',
  defense: 'defense',
};

/**
 * 将蓝图扁平 Record 转换为 EquipmentBonus 结构
 *
 * 规则：
 * - wisdom/perception/spirit/meridian/strength/vitality → attrs
 * - maxHp/maxMp/maxEnergy → resources
 * - attack/defense → combat
 */
export function parseRawBonus(raw: Record<string, number>): EquipmentBonus {
  const bonus: EquipmentBonus = {};

  for (const [key, value] of Object.entries(raw)) {
    if (!value) continue;

    if (ATTR_KEYS.has(key)) {
      if (!bonus.attrs) bonus.attrs = {};
      (bonus.attrs as Record<string, number>)[key] = value;
    } else if (key in RESOURCE_KEYS) {
      if (!bonus.resources) bonus.resources = {};
      bonus.resources[RESOURCE_KEYS[key]] = value;
    } else if (key in COMBAT_KEYS) {
      if (!bonus.combat) bonus.combat = {};
      bonus.combat[COMBAT_KEYS[key]] = value;
    }
  }

  return bonus;
}

/**
 * 将 source 的每个字段乘以 multiplier 后累加到 target
 */
export function mergeBonus(
  target: EquipmentBonus,
  source: EquipmentBonus,
  multiplier: number = 1.0,
): void {
  // 六维属性
  if (source.attrs) {
    if (!target.attrs) target.attrs = {};
    for (const [key, value] of Object.entries(source.attrs)) {
      if (!value) continue;
      const t = target.attrs as Record<string, number>;
      t[key] = (t[key] ?? 0) + Math.floor(value * multiplier);
    }
  }

  // 三维资源
  if (source.resources) {
    if (!target.resources) target.resources = {};
    const sr = source.resources;
    const tr = target.resources;
    if (sr.maxHp) tr.maxHp = (tr.maxHp ?? 0) + Math.floor(sr.maxHp * multiplier);
    if (sr.maxMp) tr.maxMp = (tr.maxMp ?? 0) + Math.floor(sr.maxMp * multiplier);
    if (sr.maxEnergy) tr.maxEnergy = (tr.maxEnergy ?? 0) + Math.floor(sr.maxEnergy * multiplier);
  }

  // 攻防
  if (source.combat) {
    if (!target.combat) target.combat = {};
    const sc = source.combat;
    const tc = target.combat;
    if (sc.attack) tc.attack = (tc.attack ?? 0) + Math.floor(sc.attack * multiplier);
    if (sc.defense) tc.defense = (tc.defense ?? 0) + Math.floor(sc.defense * multiplier);
  }
}
