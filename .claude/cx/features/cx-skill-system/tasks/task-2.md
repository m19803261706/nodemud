# Task 2: 数据库实体 + SkillService + SkillModule

## 关联

- Part of feature: 天衍技能系统
- Phase: 1 — 基础层
- Design Doc: #224
- PRD: #223

## 任务描述

创建 PlayerSkill 数据库实体、SkillService 持久化服务和 SkillModule NestJS 模块。这是技能数据持久化的基础。

### 目标文件

**新增：**

- `server/src/entities/player-skill.entity.ts` — TypeORM 实体
- `server/src/skill/skill.service.ts` — CRUD 持久化服务
- `server/src/skill/skill.module.ts` — NestJS 模块

**修改：**

- `server/src/app.module.ts` — 导入 SkillModule

### 实现要点

1. PlayerSkill 实体字段严格按照契约字段映射表
2. SkillService 提供基础 CRUD：findByCharacter、create、update、delete
3. SkillModule 注册 TypeORM 实体和 Service
4. 使用 `synchronize: true`（开发环境）自动建表

## 验收标准

- [ ] PlayerSkill 实体 10 个字段与契约完全一致
- [ ] 数据库字段 snake_case，实体字段 camelCase
- [ ] character_id 外键关联 characters 表
- [ ] unique 约束 (character_id, skill_id)
- [ ] SkillService 提供 findByCharacter / create / update / delete
- [ ] SkillModule 正确注册并在 AppModule 导入
- [ ] 服务启动不报错

## 📋 API 契约片段（来自 Design Doc）

> ⚠️ 以下契约已在 Design Doc 中锁定，实现时必须严格遵守。

### 关联字段映射

| #   | DB 字段         | TypeORM 实体  | API JSON      | 前端字段      | 类型          | 必填 |
| --- | --------------- | ------------- | ------------- | ------------- | ------------- | ---- |
| 1   | id              | id            | id            | id            | string (UUID) | ✅   |
| 2   | character_id    | character     | -             | -             | FK            | ✅   |
| 3   | skill_id        | skillId       | skillId       | skillId       | string        | ✅   |
| 4   | skill_type      | skillType     | skillType     | skillType     | SkillSlotType | ✅   |
| 5   | level           | level         | level         | level         | number        | ✅   |
| 6   | learned         | learned       | learned       | learned       | number        | ✅   |
| 7   | is_mapped       | isMapped      | isMapped      | isMapped      | boolean       | ✅   |
| 8   | mapped_slot     | mappedSlot    | mappedSlot    | mappedSlot    | string?       | ❌   |
| 9   | is_active_force | isActiveForce | isActiveForce | isActiveForce | boolean       | ✅   |
| 10  | is_locked       | isLocked      | isLocked      | isLocked      | boolean       | ✅   |

### TypeORM 实体定义

```typescript
@Entity('player_skills')
@Unique(['character', 'skillId'])
export class PlayerSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Character, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @Column({ name: 'skill_id', length: 64, comment: '技能标识' })
  skillId: string;

  @Column({ name: 'skill_type', length: 32, comment: '槽位类型' })
  skillType: string;

  @Column({ default: 0, comment: '当前等级' })
  level: number;

  @Column({ default: 0, comment: '当前积累经验' })
  learned: number;

  @Column({ name: 'is_mapped', default: false, comment: '是否映射到槽位' })
  isMapped: boolean;

  @Column({ name: 'mapped_slot', length: 32, nullable: true, comment: '映射的槽位类型' })
  mappedSlot: string | null;

  @Column({ name: 'is_active_force', default: false, comment: '是否激活的内功' })
  isActiveForce: boolean;

  @Column({ name: 'is_locked', default: false, comment: '是否锁定' })
  isLocked: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### 命名规范

- 数据库: snake_case（`skill_id`, `is_mapped`）
- TypeORM: camelCase + `@Column({ name: 'snake_case' })`
- API JSON: camelCase（序列化自动转换）

## 代码参考

- 现有实体示例: `server/src/entities/character.entity.ts`（参考 ManyToOne 关联方式）
- 现有服务示例: `server/src/account/account.service.ts`
- 现有模块示例: `server/src/account/account.module.ts`

## 相关文档

- Design Doc: #224 (数据库设计 + VO/DTO 字段映射章节)
- PRD: #223
