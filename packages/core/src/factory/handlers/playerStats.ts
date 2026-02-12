/**
 * 玩家属性消息处理器
 * 服务端定时推送玩家运行时属性和六维属性
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { PlayerStatsMessage } from '../../types/messages/playerStats';

function isValidSectSummary(sect: any): boolean {
  if (sect == null) return true;
  return (
    typeof sect === 'object' &&
    typeof sect.sectId === 'string' &&
    typeof sect.sectName === 'string' &&
    typeof sect.rank === 'string' &&
    typeof sect.masterName === 'string' &&
    typeof sect.contribution === 'number'
  );
}

@MessageHandler('playerStats')
export class PlayerStatsHandler implements IMessageHandler {
  create(data: PlayerStatsMessage['data']): PlayerStatsMessage {
    return {
      type: 'playerStats',
      data,
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      typeof data.name === 'string' &&
      (data.gender === 'male' || data.gender === 'female') &&
      typeof data.origin === 'string' &&
      typeof data.level === 'number' &&
      typeof data.levelTitle === 'string' &&
      isValidSectSummary(data.sect) &&
      typeof data.silver === 'number' &&
      !!data.hp &&
      typeof data.hp.current === 'number' &&
      typeof data.hp.max === 'number' &&
      !!data.mp &&
      typeof data.mp.current === 'number' &&
      typeof data.mp.max === 'number' &&
      !!data.energy &&
      typeof data.energy.current === 'number' &&
      typeof data.energy.max === 'number' &&
      !!data.attrs &&
      typeof data.attrs.wisdom === 'number' &&
      typeof data.attrs.perception === 'number' &&
      typeof data.attrs.spirit === 'number' &&
      typeof data.attrs.meridian === 'number' &&
      typeof data.attrs.strength === 'number' &&
      typeof data.attrs.vitality === 'number' &&
      typeof data.exp === 'number' &&
      typeof data.expToNextLevel === 'number' &&
      typeof data.potential === 'number' &&
      typeof data.score === 'number' &&
      typeof data.freePoints === 'number'
    );
  }
}
