/**
 * Character Service
 * 角色 CRUD 业务逻辑
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Character } from './character.entity';
import type { PlayerBase } from '../engine/game-objects/player-base';
import { savePlayerData } from '../websocket/handlers/stats.utils';

/** 创建角色数据 */
export interface CreateCharacterData {
  accountId: string;
  name: string;
  origin: Character['origin'];
  gender: 'male' | 'female';
  fateName: string;
  fateType: string;
  fatePoem: string;
  destiny: number;
  benefactor: number;
  calamity: number;
  fortune: number;
  wisdom: number;
  perception: number;
  spirit: number;
  meridian: number;
  strength: number;
  vitality: number;
  wisdomCap: number;
  perceptionCap: number;
  spiritCap: number;
  meridianCap: number;
  strengthCap: number;
  vitalityCap: number;
  astrolabeJson: object;
  wuxingju: string;
  mingzhuStar: string;
  shenzhuStar: string;
  silver: number;
}

@Injectable()
export class CharacterService {
  private readonly logger = new Logger(CharacterService.name);

  constructor(
    @InjectRepository(Character)
    private readonly characterRepository: Repository<Character>,
  ) {}

  /** 根据角色ID查找角色 */
  async findById(id: string): Promise<Character | null> {
    return this.characterRepository.findOne({ where: { id } });
  }

  /** 根据账号ID查找角色 */
  async findByAccountId(accountId: string): Promise<Character | null> {
    return this.characterRepository.findOne({ where: { accountId } });
  }

  /** 检查角色名是否存在 */
  async isNameExists(name: string): Promise<boolean> {
    const count = await this.characterRepository.count({ where: { name } });
    return count > 0;
  }

  /** 创建角色 */
  async create(data: CreateCharacterData): Promise<Character> {
    const character = this.characterRepository.create({
      id: uuidv4(),
      ...data,
    });
    return this.characterRepository.save(character);
  }

  /** 更新角色最后所在房间 */
  async updateLastRoom(id: string, roomId: string): Promise<void> {
    await this.characterRepository.update(id, { lastRoom: roomId });
  }

  /** 更新角色银两 */
  async updateSilver(id: string, silver: number): Promise<void> {
    await this.characterRepository.update(id, { silver: Math.max(0, Math.floor(silver)) });
  }

  /**
   * 保存玩家运行时数据到数据库
   * 将 PlayerBase dbase 中的 exp/level/potential/learned_points/score/free_points/quests/sect/work/silver 写回 Character
   */
  async savePlayerDataToDB(player: PlayerBase, characterId: string): Promise<void> {
    try {
      const character = await this.findById(characterId);
      if (!character) {
        this.logger.warn(`保存玩家数据失败: 角色 ${characterId} 不存在`);
        return;
      }

      // 使用 stats.utils 中的 savePlayerData 将 dbase 数据写入 Character 实体
      savePlayerData(player, character);

      // 持久化到数据库
      await this.characterRepository.save(character);
      this.logger.log(`玩家数据已保存: ${character.name} (${characterId})`);
    } catch (error) {
      this.logger.error(`保存玩家数据失败 (${characterId}):`, error);
    }
  }
}
