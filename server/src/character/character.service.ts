/**
 * Character Service
 * 角色 CRUD 业务逻辑
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Character } from './character.entity';

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
}

@Injectable()
export class CharacterService {
  constructor(
    @InjectRepository(Character)
    private readonly characterRepository: Repository<Character>,
  ) {}

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
}
