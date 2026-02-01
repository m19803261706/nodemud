/**
 * Account 实体
 * 账号数据表映射
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('account')
export class Account {
  @PrimaryGeneratedColumn('uuid', { comment: '账号ID (UUID v4)' })
  id: string;

  @Index('idx_username')
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    comment: '用户名（唯一，6-20字符，需含数字和字母）',
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '密码（bcrypt加密）',
  })
  password: string;

  @Index('idx_phone')
  @Column({
    type: 'varchar',
    length: 20,
    comment: '手机号（11位）',
  })
  phone: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    comment: '创建时间',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    comment: '更新时间',
  })
  updatedAt: Date;

  @Column({
    name: 'last_login_at',
    type: 'timestamp',
    nullable: true,
    comment: '最后登录时间',
  })
  lastLoginAt: Date | null;
}
