/**
 * PlayerSkill 实体
 * 玩家技能数据表映射 - 记录角色习得的技能及其状态
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Character } from '../character/character.entity';

@Entity('player_skills')
@Unique(['character', 'skillId'])
export class PlayerSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 关联角色（多对一，角色删除时级联删除） */
  @ManyToOne(() => Character, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'character_id' })
  character: Character;

  /** 技能标识（如 "basic-sword"） */
  @Column({ name: 'skill_id', length: 64, comment: '技能标识' })
  skillId: string;

  /** 槽位类型（如 "force", "dodge", "weapon" 等） */
  @Column({ name: 'skill_type', length: 32, comment: '槽位类型' })
  skillType: string;

  /** 当前等级 */
  @Column({ default: 0, comment: '当前等级' })
  level: number;

  /** 当前积累经验 */
  @Column({ default: 0, comment: '当前积累经验' })
  learned: number;

  /** 是否映射到槽位 */
  @Column({ name: 'is_mapped', default: false, comment: '是否映射到槽位' })
  isMapped: boolean;

  /** 映射的槽位类型（可为空） */
  @Column({ name: 'mapped_slot', length: 32, nullable: true, comment: '映射的槽位类型' })
  mappedSlot: string | null;

  /** 是否激活的内功 */
  @Column({ name: 'is_active_force', default: false, comment: '是否激活的内功' })
  isActiveForce: boolean;

  /** 是否锁定 */
  @Column({ name: 'is_locked', default: false, comment: '是否锁定' })
  isLocked: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
