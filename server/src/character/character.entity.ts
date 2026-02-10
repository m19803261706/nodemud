/**
 * Character 实体
 * 角色数据表映射（一账号一角色）
 */

import { Entity, Column, PrimaryColumn, CreateDateColumn, Index } from 'typeorm';

/** 出身枚举 */
export type CharacterOriginType =
  | 'noble'
  | 'wanderer'
  | 'scholar'
  | 'soldier'
  | 'herbalist'
  | 'beggar';

@Entity('character')
export class Character {
  @PrimaryColumn({ type: 'char', length: 36, comment: '角色ID (UUID v4)' })
  id: string;

  @Column({
    name: 'account_id',
    type: 'char',
    length: 36,
    unique: true,
    comment: '关联账号ID（唯一，一对一）',
  })
  @Index('uk_account_id', { unique: true })
  accountId: string;

  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
    comment: '角色名（2-6中文字符，全服唯一）',
  })
  @Index('uk_name', { unique: true })
  name: string;

  @Column({
    type: 'enum',
    enum: ['noble', 'wanderer', 'scholar', 'soldier', 'herbalist', 'beggar'],
    comment: '出身类型',
  })
  origin: CharacterOriginType;

  @Column({
    type: 'enum',
    enum: ['male', 'female'],
    comment: '性别（影响紫微排盘结果）',
  })
  gender: 'male' | 'female';

  // ========== 命格字段 ==========

  @Column({
    name: 'fate_name',
    type: 'varchar',
    length: 20,
    comment: '命格名称（如"天机化变"）',
  })
  fateName: string;

  @Column({
    name: 'fate_type',
    type: 'varchar',
    length: 20,
    comment: '命宫主星标识（如"tianji"）',
  })
  @Index('idx_fate_type')
  fateType: string;

  @Column({
    name: 'fate_poem',
    type: 'varchar',
    length: 100,
    comment: '命格诗句',
  })
  fatePoem: string;

  @Column({ type: 'tinyint', unsigned: true, comment: '命数 1-5' })
  destiny: number;

  @Column({ type: 'tinyint', unsigned: true, comment: '贵人 1-5' })
  benefactor: number;

  @Column({ type: 'tinyint', unsigned: true, comment: '劫数 1-5' })
  calamity: number;

  @Column({ type: 'tinyint', unsigned: true, comment: '机缘 1-5' })
  fortune: number;

  // ========== 属性字段（最终值 = 根基 + 出身加成） ==========

  @Column({ type: 'tinyint', unsigned: true, comment: '慧根' })
  wisdom: number;

  @Column({ type: 'tinyint', unsigned: true, comment: '心眼' })
  perception: number;

  @Column({ type: 'tinyint', unsigned: true, comment: '气海' })
  spirit: number;

  @Column({ type: 'tinyint', unsigned: true, comment: '脉络' })
  meridian: number;

  @Column({ type: 'tinyint', unsigned: true, comment: '筋骨' })
  strength: number;

  @Column({ type: 'tinyint', unsigned: true, comment: '血气' })
  vitality: number;

  // ========== 属性上限字段 ==========

  @Column({
    name: 'wisdom_cap',
    type: 'tinyint',
    unsigned: true,
    comment: '慧根上限',
  })
  wisdomCap: number;

  @Column({
    name: 'perception_cap',
    type: 'tinyint',
    unsigned: true,
    comment: '心眼上限',
  })
  perceptionCap: number;

  @Column({
    name: 'spirit_cap',
    type: 'tinyint',
    unsigned: true,
    comment: '气海上限',
  })
  spiritCap: number;

  @Column({
    name: 'meridian_cap',
    type: 'tinyint',
    unsigned: true,
    comment: '脉络上限',
  })
  meridianCap: number;

  @Column({
    name: 'strength_cap',
    type: 'tinyint',
    unsigned: true,
    comment: '筋骨上限',
  })
  strengthCap: number;

  @Column({
    name: 'vitality_cap',
    type: 'tinyint',
    unsigned: true,
    comment: '血气上限',
  })
  vitalityCap: number;

  // ========== 排盘数据 ==========

  @Column({
    name: 'astrolabe_json',
    type: 'json',
    comment: '紫微排盘完整数据（iztro 原始输出）',
  })
  astrolabeJson: object;

  @Column({
    type: 'varchar',
    length: 10,
    comment: '五行局（如"水二局"）',
  })
  wuxingju: string;

  @Column({
    name: 'mingzhu_star',
    type: 'varchar',
    length: 10,
    comment: '命主星',
  })
  mingzhuStar: string;

  @Column({
    name: 'shenzhu_star',
    type: 'varchar',
    length: 10,
    comment: '身主星',
  })
  shenzhuStar: string;

  // ========== 位置 ==========

  @Column({
    name: 'last_room',
    type: 'varchar',
    length: 255,
    default: 'area/rift-town/square',
    comment: '最后所在房间ID',
  })
  lastRoom: string;

  @Column({
    type: 'int',
    unsigned: true,
    default: 100,
    comment: '当前银两',
  })
  silver: number;

  // ========== 时间 ==========

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    comment: '创建时间',
  })
  createdAt: Date;
}
