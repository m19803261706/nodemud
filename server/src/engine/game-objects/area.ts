/**
 * Area -- 区域管理器
 *
 * 游戏世界的区域单元，包含若干房间、NPC 刷新规则等。
 * 继承 BaseEntity，通过 Dbase 存储区域配置数据。
 */
import { BaseEntity } from '../base-entity';

/** NPC 刷新规则 */
export interface SpawnRule {
  /** 蓝图 ID */
  blueprintId: string;
  /** 刷新到哪个房间 */
  roomId: string;
  /** 刷新数量 */
  count: number;
  /** 刷新间隔（毫秒） */
  interval: number;
}

export class Area extends BaseEntity {
  /** 区域默认单例（virtual = true 表示不依赖蓝图实例化） */
  static virtual = true;

  constructor(id: string) {
    super(id);
  }

  /** 区域永不自毁（虚拟对象，生命周期由世界管理） */
  public onCleanUp(): boolean {
    return false;
  }

  /** 获取区域名称 */
  getName(): string {
    return this.get<string>('name') ?? '未知区域';
  }

  /** 获取区域等级范围 */
  getLevelRange(): { min: number; max: number } | undefined {
    return this.get('level_range');
  }

  /** 获取区域包含的房间蓝图 ID 列表 */
  getRoomIds(): string[] {
    return this.get<string[]>('rooms') ?? [];
  }

  /** 获取 NPC 刷新规则 */
  getSpawnRules(): SpawnRule[] {
    return this.get('spawn_rules') ?? [];
  }

  /** 获取物品刷新规则 */
  getItemSpawnRules(): SpawnRule[] {
    return this.get('item_spawn_rules') ?? [];
  }
}
