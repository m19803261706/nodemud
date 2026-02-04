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

/** 从 Character 实体推导 playerStats 消息数据 */
export function derivePlayerStats(character: Character) {
  const hpMax = character.vitality * 100;
  const mpMax = character.spirit * 80;
  const energyMax = (character.wisdom + character.perception) * 50;

  return {
    name: character.name,
    level: getLevelText(),
    hp: { current: hpMax, max: hpMax },
    mp: { current: mpMax, max: mpMax },
    energy: { current: energyMax, max: energyMax },
    attrs: {
      wisdom: character.wisdom,
      perception: character.perception,
      spirit: character.spirit,
      meridian: character.meridian,
      strength: character.strength,
      vitality: character.vitality,
    },
  };
}

/** 推送 playerStats 到客户端 */
export function sendPlayerStats(
  player: PlayerBase,
  character: Character,
): void {
  const data = derivePlayerStats(character);
  const msg = MessageFactory.create('playerStats', data);
  if (msg) {
    player.sendToClient(MessageFactory.serialize(msg));
  }
}
