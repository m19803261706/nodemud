/**
 * 玩家属性工具函数
 * 从 Character 实体推导运行时属性（HP/MP/精力），构建并推送 playerStats 消息
 */

import { MessageFactory } from '@packages/core';
import type { Character } from '../../character/character.entity';
import type { PlayerBase } from '../../engine/game-objects/player-base';
import type { PlayerQuestData } from '../../engine/quest';

/** 等级映射（当前新角色固定） */
function getLevelText(): string {
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

/** 从 Character 实体 + 玩家装备推导 playerStats 消息数据 */
export function derivePlayerStats(character: Character, player: PlayerBase) {
  const equipBonus = player.getEquipmentBonus();

  const hpMax = character.vitality * 100 + (equipBonus.resources?.maxHp ?? 0);
  const mpMax = character.spirit * 80 + (equipBonus.resources?.maxMp ?? 0);
  const energyMax =
    (character.wisdom + character.perception) * 50 + (equipBonus.resources?.maxEnergy ?? 0);

  // 资源当前值（优先运行时字段，兼容旧字段）
  const hpCurrent = resolveCurrentValue(player, 'hp', 'hp_current', hpMax);
  const mpCurrent = resolveCurrentValue(player, 'mp', 'mp_current', mpMax);
  const energyCurrent = resolveCurrentValue(player, 'energy', 'energy_current', energyMax);
  const silver = resolveSilver(player, character);

  return {
    name: character.name,
    level: getLevelText(),
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
  };
}

/**
 * 将 Character 实体的属性加载到 PlayerBase 的 dbase
 * 登录 / 创建角色进场时必须调用，确保战斗系统能读取到四维属性和 HP
 */
export function loadCharacterToPlayer(player: PlayerBase, character: Character): void {
  // 六维属性
  player.set('wisdom', character.wisdom);
  player.set('perception', character.perception);
  player.set('spirit', character.spirit);
  player.set('meridian', character.meridian);
  player.set('strength', character.strength);
  player.set('vitality', character.vitality);

  // 等级与经验
  player.set('level', character.level ?? 1);
  player.set('exp', character.exp ?? 0);
  player.set('potential', character.potential ?? 0);
  player.set('score', character.score ?? 0);
  player.set('free_points', character.freePoints ?? 0);

  // 任务数据
  player.set('quests', character.questData ?? null);

  // HP 上限 = 血气 * 100 + 装备加成
  const equipBonus = player.getEquipmentBonus();
  const maxHp = character.vitality * 100 + (equipBonus.resources?.maxHp ?? 0);
  player.set('max_hp', maxHp);
  // 登录时满血（若已有当前 HP 则保留）
  if (player.get<number>('hp') == null) {
    player.set('hp', maxHp);
  }

  // 银两
  player.set('silver', Math.max(0, Math.floor(character.silver ?? 0)));
}

/**
 * 将 PlayerBase 的 dbase 运行时数据保存回 Character 实体
 * 断线 / 定期存档时调用，确保 exp/level/potential/score/free_points/quests 持久化
 */
export function savePlayerData(player: PlayerBase, character: Character): void {
  // 经验与等级
  character.exp = player.get<number>('exp') ?? character.exp ?? 0;
  character.level = player.get<number>('level') ?? character.level ?? 1;
  character.potential = player.get<number>('potential') ?? character.potential ?? 0;
  character.score = player.get<number>('score') ?? character.score ?? 0;
  character.freePoints = player.get<number>('free_points') ?? character.freePoints ?? 0;

  // 任务数据
  character.questData = player.get<PlayerQuestData>('quests') ?? character.questData ?? null;

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
