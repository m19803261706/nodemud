/**
 * 玩家属性工具函数
 * 从 Character 实体推导运行时属性（HP/MP/精力），构建并推送 playerStats 消息
 */

import { MessageFactory } from '@packages/core';
import type { Character } from '../../character/character.entity';
import type { PlayerBase } from '../../engine/game-objects/player-base';
import type { PlayerQuestData } from '../../engine/quest';
import type { PlayerSectData } from '../../engine/sect/types';
import { normalizePlayerSectData } from '../../engine/sect/types';
import { ServiceLocator } from '../../engine/service-locator';

/** 等级映射（通过 ExpManager 获取等级称号） */
function getLevelText(level: number): string {
  if (ServiceLocator.initialized && ServiceLocator.expManager) {
    return ServiceLocator.expManager.getLevelTitle(level);
  }
  return '初入江湖';
}

/** 资源当前值读取（优先 runtime 字段，兼容 legacy *_current 字段） */
function resolveCurrentValue(
  player: PlayerBase,
  runtimeKey: 'hp' | 'mp' | 'energy',
  legacyKey: 'hp_current' | 'mp_current' | 'energy_current',
  max: number,
): number {
  const runtimeVal = player.get<number>(runtimeKey);
  const legacyVal = player.get<number>(legacyKey);
  const current = runtimeVal ?? legacyVal ?? max;
  return Math.min(Math.max(current, 0), max);
}

/** 货币当前值读取（优先 runtime 字段） */
function resolveSilver(player: PlayerBase, character: Character): number {
  const runtimeVal = player.get<number>('silver');
  const base = runtimeVal ?? character.silver ?? 0;
  if (!Number.isFinite(base)) return 0;
  return Math.max(0, Math.floor(base));
}

/** 数值规范化：转非负整数 */
function toSafeInt(value: unknown, fallback = 0): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.floor(value));
}

/** Character 字段到运行时 dbase 的别名映射 */
const CHARACTER_TO_DBASE_ALIASES: Record<string, string[]> = {
  id: ['characterId'],
  lastRoom: ['last_room'],
  freePoints: ['free_points'],
  learnedPoints: ['learned_points'],
  questData: ['quests'],
  sectData: ['sect'],
};

/** dbase 赋值克隆，避免 Character 实体对象引用被运行时逻辑污染 */
function cloneForDbase<T>(value: T): T {
  if (value == null) return value;
  if (value instanceof Date) return new Date(value.getTime()) as T;
  if (Array.isArray(value)) {
    return value.map((item) => cloneForDbase(item)) as T;
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = cloneForDbase(v);
    }
    return out as T;
  }
  return value;
}

/** 将 Character 的全部字段快照写入 player dbase（含别名） */
function hydrateCharacterSnapshot(player: PlayerBase, character: Character): void {
  const snapshot = character as unknown as Record<string, unknown>;
  for (const [key, raw] of Object.entries(snapshot)) {
    if (raw === undefined) continue;
    const value = cloneForDbase(raw);
    player.set(key, value);

    const aliases = CHARACTER_TO_DBASE_ALIASES[key];
    if (!aliases) continue;
    for (const alias of aliases) {
      player.set(alias, cloneForDbase(raw));
    }
  }
}

/** 从 Character 实体 + 玩家装备推导 playerStats 消息数据 */
export function derivePlayerStats(character: Character, player: PlayerBase) {
  const equipBonus = player.getEquipmentBonus();
  const skillBonus = player.getSkillBonusSummary();

  // 上限统一优先取运行时 max_*，避免与战斗/恢复链路产生分叉
  const runtimeHpMax = player.get<number>('max_hp');
  const runtimeMpMax = player.get<number>('max_mp');
  const runtimeEnergyMax = player.get<number>('max_energy');

  const hpBase = runtimeHpMax ?? character.vitality * 100 + (equipBonus.resources?.maxHp ?? 0);
  const mpBase = runtimeMpMax ?? character.spirit * 80 + (equipBonus.resources?.maxMp ?? 0);
  const energyBase =
    runtimeEnergyMax ??
    (character.wisdom + character.perception) * 50 + (equipBonus.resources?.maxEnergy ?? 0);

  const hpMax = Math.max(0, Math.floor(hpBase + (skillBonus.maxHp ?? 0)));
  const mpMax = Math.max(0, Math.floor(mpBase + (skillBonus.maxMp ?? 0)));
  const energyMax = Math.max(0, Math.floor(energyBase));

  // 资源当前值（优先运行时字段，兼容旧字段）
  const hpCurrent = resolveCurrentValue(player, 'hp', 'hp_current', hpMax);
  const mpCurrent = resolveCurrentValue(player, 'mp', 'mp_current', mpMax);
  const energyCurrent = resolveCurrentValue(player, 'energy', 'energy_current', energyMax);
  const silver = resolveSilver(player, character);

  // 经验与等级数据（优先从 dbase 读取运行时值）
  const level = player.get<number>('level') ?? character.level ?? 1;
  const exp = player.get<number>('exp') ?? character.exp ?? 0;
  const potential = player.get<number>('potential') ?? character.potential ?? 0;
  const learnedPoints = player.get<number>('learned_points') ?? character.learnedPoints ?? 0;
  const availablePotential = Math.max(0, potential - learnedPoints);
  const score = player.get<number>('score') ?? character.score ?? 0;
  const freePoints = player.get<number>('free_points') ?? character.freePoints ?? 0;

  // 下一级所需经验（通过 ExpManager 计算）
  let expToNextLevel = 0;
  if (ServiceLocator.initialized && ServiceLocator.expManager) {
    const nextLevelExp = ServiceLocator.expManager.getExpForLevel(level + 1);
    expToNextLevel = Math.max(0, nextLevelExp - exp);
  }

  return {
    name: character.name,
    level,
    levelTitle: getLevelText(level),
    silver,
    hp: { current: hpCurrent, max: hpMax },
    mp: { current: mpCurrent, max: mpMax },
    energy: { current: energyCurrent, max: energyMax },
    attrs: {
      wisdom: character.wisdom,
      perception: character.perception,
      spirit: character.spirit,
      meridian: character.meridian,
      strength: character.strength,
      vitality: character.vitality,
    },
    equipBonus,
    combat: {
      attack: equipBonus.combat?.attack ?? 0,
      defense: equipBonus.combat?.defense ?? 0,
    },
    exp,
    expToNextLevel,
    potential: availablePotential,
    score,
    freePoints,
  };
}

/**
 * 将 Character 实体的属性加载到 PlayerBase 的 dbase
 * 登录 / 创建角色进场时必须调用，确保运行时关键字段一次性完整初始化
 */
export function loadCharacterToPlayer(player: PlayerBase, character: Character): void {
  // 先做全量快照恢复，避免新增字段遗漏初始化
  hydrateCharacterSnapshot(player, character);

  // 角色标识与展示字段
  player.set('name', character.name);
  player.set('characterId', character.id);

  // 等级与经验
  const level = Math.max(1, toSafeInt(character.level, 1));
  const exp = toSafeInt(character.exp, 0);
  player.set('level', level);
  player.set('exp', exp);
  // 兼容传统武学门槛字段，统一与 exp 同步
  player.set('combat_exp', exp);
  player.set('potential', toSafeInt(character.potential, 0));
  player.set('learned_points', toSafeInt(character.learnedPoints, 0));
  player.set('score', toSafeInt(character.score, 0));
  player.set('free_points', toSafeInt(character.freePoints, 0));

  // 任务数据
  player.set('quests', cloneForDbase(character.questData ?? null));
  // 门派数据（保持统一结构，避免登录后缺字段）
  player.set('sect', normalizePlayerSectData(character.sectData ?? null));

  // HP 上限 = 血气 * 100 + 装备加成
  const equipBonus = player.getEquipmentBonus();
  const maxHp = character.vitality * 100 + (equipBonus.resources?.maxHp ?? 0);
  const maxMp = character.spirit * 80 + (equipBonus.resources?.maxMp ?? 0);
  const maxEnergy =
    (character.wisdom + character.perception) * 50 + (equipBonus.resources?.maxEnergy ?? 0);
  player.set('max_hp', maxHp);
  player.set('max_mp', maxMp);
  player.set('max_energy', maxEnergy);

  // 登录时资源值统一规范化并钳制到当前上限
  const hp = Math.min(Math.max(player.get<number>('hp') ?? maxHp, 0), maxHp);
  const mp = Math.min(Math.max(player.get<number>('mp') ?? maxMp, 0), maxMp);
  const energy = Math.min(Math.max(player.get<number>('energy') ?? maxEnergy, 0), maxEnergy);
  player.set('hp', hp);
  player.set('mp', mp);
  player.set('energy', energy);

  // 兼容旧字段：保持 legacy *_current 与运行时字段一致
  player.set('hp_current', hp);
  player.set('mp_current', mp);
  player.set('energy_current', energy);

  // 银两
  player.set('silver', toSafeInt(character.silver, 0));
}

/**
 * 将 PlayerBase 的 dbase 运行时数据保存回 Character 实体
 * 断线 / 定期存档时调用，确保 exp/level/potential/learned_points/score/free_points/quests/silver 持久化
 */
export function savePlayerData(player: PlayerBase, character: Character): void {
  // 经验与等级
  character.exp = toSafeInt(
    player.get<number>('exp') ?? player.get<number>('combat_exp') ?? character.exp ?? 0,
    0,
  );
  character.level = Math.max(1, toSafeInt(player.get<number>('level') ?? character.level ?? 1, 1));
  character.potential = toSafeInt(player.get<number>('potential') ?? character.potential ?? 0, 0);
  character.learnedPoints = toSafeInt(
    player.get<number>('learned_points') ?? character.learnedPoints ?? 0,
    0,
  );
  character.score = toSafeInt(player.get<number>('score') ?? character.score ?? 0, 0);
  character.freePoints = toSafeInt(
    player.get<number>('free_points') ?? character.freePoints ?? 0,
    0,
  );

  // 任务数据
  character.questData = player.get<PlayerQuestData>('quests') ?? character.questData ?? null;
  // 门派数据
  character.sectData = normalizePlayerSectData(
    player.get<PlayerSectData>('sect') ?? character.sectData ?? null,
  );

  // 银两
  const silver = player.get<number>('silver');
  if (silver != null && Number.isFinite(silver)) {
    character.silver = Math.max(0, Math.floor(silver));
  }
}

/** 推送 playerStats 到客户端 */
export function sendPlayerStats(player: PlayerBase, character: Character): void {
  const data = derivePlayerStats(character, player);
  const msg = MessageFactory.create('playerStats', data);
  if (msg) {
    player.sendToClient(MessageFactory.serialize(msg));
  }
}
