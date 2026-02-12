/**
 * ExplorationService
 * 玩家探索记录服务 — 管理房间解锁与查询
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerExploration } from './player-exploration.entity';

@Injectable()
export class ExplorationService {
  private readonly logger = new Logger(ExplorationService.name);

  constructor(
    @InjectRepository(PlayerExploration)
    private readonly explorationRepo: Repository<PlayerExploration>,
  ) {}

  /**
   * 解锁房间探索记录（INSERT IGNORE 语义，已存在则跳过）
   */
  async unlockRoom(characterId: string, areaId: string, roomId: string): Promise<void> {
    try {
      await this.explorationRepo
        .createQueryBuilder()
        .insert()
        .into(PlayerExploration)
        .values({ characterId, areaId, roomId })
        .orIgnore() // 唯一约束冲突时忽略
        .execute();
    } catch (error) {
      this.logger.error(`解锁房间失败: char=${characterId} room=${roomId}`, error);
    }
  }

  /**
   * 查询玩家在指定区域已探索的房间 ID 列表
   */
  async getExploredRoomIds(characterId: string, areaId: string): Promise<string[]> {
    const records = await this.explorationRepo.find({
      where: { characterId, areaId },
      select: ['roomId'],
    });
    return records.map((r) => r.roomId);
  }
}
