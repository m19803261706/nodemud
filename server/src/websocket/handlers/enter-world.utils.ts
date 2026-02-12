/**
 * 统一进场工具：
 * 将“创建 Player + 绑定连接 + 初始化 + 进房 + 推送首帧数据”收口为单入口流程。
 */

import type { Character } from '../../character/character.entity';
import { BlueprintFactory } from '../../engine/blueprint-factory';
import { ObjectManager } from '../../engine/object-manager';
import { PlayerBase } from '../../engine/game-objects/player-base';
import type { RoomBase } from '../../engine/game-objects/room-base';
import { loadCharacterToPlayer, sendPlayerStats } from './stats.utils';
import { sendRoomInfo } from './room-utils';
import type { Session } from '../types/session';
import type { ExplorationService } from '../../character/exploration.service';

interface EnterWorldLogger {
  warn(message: string): void;
}

export interface EnterWorldOptions {
  client: any;
  session: Session;
  character: Character;
  objectManager: ObjectManager;
  blueprintFactory: BlueprintFactory;
  defaultRoomId: string;
  entryBroadcastText: string;
  useLastRoom?: boolean;
  logger?: EnterWorldLogger;
  explorationService?: ExplorationService;
}

export async function enterWorldWithCharacter(options: EnterWorldOptions): Promise<PlayerBase> {
  const {
    client,
    session,
    character,
    objectManager,
    blueprintFactory,
    defaultRoomId,
    entryBroadcastText,
    useLastRoom = false,
    logger,
    explorationService,
  } = options;

  // 1) 创建并注册玩家对象
  const playerId = objectManager.nextInstanceId('player');
  const player = new PlayerBase(playerId);
  objectManager.register(player);
  loadCharacterToPlayer(player, character);

  // 2) 绑定连接并写入 session
  player.bindConnection((msg: any) => {
    const payload = typeof msg === 'string' ? msg : JSON.stringify(msg);
    client.send(payload);
  });
  session.playerId = playerId;
  session.characterId = character.id;

  // 3) 统一运行时初始化（技能/临时态等）
  await player.setupOnEnterWorld(character.id);

  // 4) 选择进场房间（可选使用上次下线点）
  const preferredRoomId = useLastRoom ? character.lastRoom || defaultRoomId : defaultRoomId;
  const room =
    (blueprintFactory.getVirtual(preferredRoomId) as RoomBase | undefined) ??
    (preferredRoomId !== defaultRoomId
      ? (blueprintFactory.getVirtual(defaultRoomId) as RoomBase | undefined)
      : undefined);

  if (!room) {
    logger?.warn(`房间 ${preferredRoomId} 和默认房间都不存在`);
    return player;
  }

  // 5) 进入房间并推送首帧数据
  await player.moveTo(room, { quiet: true });
  sendRoomInfo(player, room, blueprintFactory);
  sendPlayerStats(player, character);
  room.broadcast(entryBroadcastText, player);

  // 6) 异步解锁进场房间探索记录
  if (explorationService) {
    const parts = room.id.split('/');
    if (parts.length >= 3) {
      const areaId = `${parts[0]}/${parts[1]}`;
      explorationService.unlockRoom(character.id, areaId, room.id).catch(() => {
        // 静默处理，不阻塞进场
      });
    }
  }

  return player;
}
