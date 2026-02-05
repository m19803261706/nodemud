/**
 * 玩家属性工具函数
 * 从 Character 实体推导运行时属性（HP/MP/精力），构建并推送 playerStats 消息
 */

import { MessageFactory } from '@packages/core';
import type { Character } from '../../character/character.entity';
import type { PlayerBase } from '../../engine/game-objects/player-base';

/** 等级映射（当前新角色固定） */
function getLevelText(): string {
  return '初入江湖';
}

/** 从 Character 实体 + 玩家装备推导 playerStats 消息数据 */
export function derivePlayerStats(character: Character, player: PlayerBase) {
  const equipBonus = player.getEquipmentBonus();

  const hpMax = character.vitality * 100 + (equipBonus.resources?.maxHp ?? 0);
  const mpMax = character.spirit * 80 + (equipBonus.resources?.maxMp ?? 0);
  const energyMax =
    (character.wisdom + character.perception) * 50 + (equipBonus.resources?.maxEnergy ?? 0);

  // 资源当前值钳制（脱装备降低上限时不超过新上限）
  const hpCurrent = Math.min(player.get<number>('hp_current') ?? hpMax, hpMax);
  const mpCurrent = Math.min(player.get<number>('mp_current') ?? mpMax, mpMax);
  const energyCurrent = Math.min(player.get<number>('energy_current') ?? energyMax, energyMax);

  return {
    name: character.name,
    level: getLevelText(),
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

/** 推送 playerStats 到客户端 */
export function sendPlayerStats(player: PlayerBase, character: Character): void {
  const data = derivePlayerStats(character, player);
  const msg = MessageFactory.create('playerStats', data);
  if (msg) {
    player.sendToClient(MessageFactory.serialize(msg));
  }
}
