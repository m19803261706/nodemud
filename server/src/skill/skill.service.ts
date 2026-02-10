/**
 * SkillService
 * 技能持久化服务 - 提供 PlayerSkill 的 CRUD 操作
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerSkill } from '../entities/player-skill.entity';

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(PlayerSkill)
    private readonly playerSkillRepository: Repository<PlayerSkill>,
  ) {}

  /**
   * 查询角色的全部技能
   * @param characterId 角色ID
   * @returns 该角色的所有 PlayerSkill 记录
   */
  async findByCharacter(characterId: string): Promise<PlayerSkill[]> {
    return this.playerSkillRepository.find({
      where: { character: { id: characterId } },
    });
  }

  /**
   * 创建新技能记录
   * @param data 技能数据（需包含 character 关联）
   * @returns 新建的 PlayerSkill 实体
   */
  async create(data: Partial<PlayerSkill>): Promise<PlayerSkill> {
    const skill = this.playerSkillRepository.create(data);
    return this.playerSkillRepository.save(skill);
  }

  /**
   * 更新单条技能记录
   * @param id PlayerSkill 主键
   * @param data 需要更新的字段
   * @returns 更新后的 PlayerSkill 实体
   */
  async update(id: string, data: Partial<PlayerSkill>): Promise<PlayerSkill | null> {
    await this.playerSkillRepository.update(id, data);
    return this.playerSkillRepository.findOne({ where: { id } });
  }

  /**
   * 删除技能记录
   * @param id PlayerSkill 主键
   */
  async delete(id: string): Promise<void> {
    await this.playerSkillRepository.delete(id);
  }

  /**
   * 批量更新技能记录（用于槽位映射等批量操作）
   * @param updates 更新列表，每项包含 id 和需要更新的字段
   */
  async updateMany(updates: { id: string; data: Partial<PlayerSkill> }[]): Promise<void> {
    // 使用事务确保批量更新的原子性
    await this.playerSkillRepository.manager.transaction(async (manager) => {
      for (const { id, data } of updates) {
        await manager.update(PlayerSkill, id, data);
      }
    });
  }
}
