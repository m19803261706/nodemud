/**
 * PlayerExploration 实体
 * 玩家探索记录数据表映射 — 记录玩家已探索（解锁）的房间
 */

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Unique, Index } from 'typeorm';

@Entity('player_exploration')
@Unique('uk_char_room', ['characterId', 'roomId'])
export class PlayerExploration {
  @PrimaryGeneratedColumn('uuid', { comment: '探索记录ID (UUID v4)' })
  id: string;

  @Column({
    name: 'character_id',
    type: 'char',
    length: 36,
    comment: '角色ID',
  })
  @Index('idx_character_id')
  characterId: string;

  @Column({
    name: 'area_id',
    type: 'varchar',
    length: 100,
    comment: '区域蓝图ID（如 area/rift-town）',
  })
  areaId: string;

  @Column({
    name: 'room_id',
    type: 'varchar',
    length: 100,
    comment: '房间蓝图ID（如 area/rift-town/square）',
  })
  roomId: string;

  @CreateDateColumn({
    name: 'unlocked_at',
    type: 'timestamp',
    comment: '解锁时间',
  })
  unlockedAt: Date;
}
