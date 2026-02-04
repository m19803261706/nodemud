/**
 * RoomBase -- 房间基类
 *
 * 继承 BaseEntity，提供房间相关的核心功能：
 * - 广播消息给房间内所有对象
 * - 房间描述（短/长）
 * - 出口管理
 * - 地图坐标
 *
 * 对标: LPC room.c / 炎黄 ROOM_D
 */
import { BaseEntity } from '../base-entity';

export class RoomBase extends BaseEntity {
  /** 房间默认单例（虚拟对象） */
  static virtual = true;

  constructor(id: string) {
    super(id);
    // 虚拟房间不应被 GC 清理（房间没有父环境，但不是孤立对象）
    this.set('no_clean_up', true);
  }

  /** 广播消息给房间内所有对象（对标 LPC tell_room） */
  broadcast(message: string, exclude?: BaseEntity): void {
    for (const entity of this.getInventory()) {
      if (entity !== exclude) {
        entity.emit('message', { message });
      }
    }
  }

  /** 获取房间简短描述 */
  getShort(): string {
    return this.get<string>('short') ?? '未知地点';
  }

  /** 获取房间详细描述 */
  getLong(): string {
    return this.get<string>('long') ?? '这里什么也没有。';
  }

  /** 获取出口列表 */
  getExits(): Record<string, string> {
    return this.get<Record<string, string>>('exits') ?? {};
  }

  /** 查询某方向出口 */
  getExit(direction: string): string | undefined {
    return this.getExits()[direction];
  }

  /** 获取地图坐标 */
  getCoordinates(): { x: number; y: number; z?: number } | undefined {
    return this.get('coordinates');
  }
}
