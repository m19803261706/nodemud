/**
 * 烟雨镇 — 区域定义
 * 江南水乡小镇，表面宁静，暗流涌动
 */
import { Area } from '../../../engine/game-objects/area';

export default class JiangnanArea extends Area {
  static virtual = true;

  create() {
    this.set('name', '烟雨镇');
    this.set('description', '江南水乡小镇，表面宁静，暗流涌动');
    this.set('region', '东南·江南');
    this.set('level_range', { min: 6, max: 12 });
    this.set('rooms', [
      'area/jiangnan/west-dock',
      'area/jiangnan/main-canal',
      'area/jiangnan/teahouse',
      'area/jiangnan/east-dock',
    ]);
    this.set('spawn_rules', [
      {
        blueprintId: 'npc/jiangnan/teahouse-gu',
        roomId: 'area/jiangnan/teahouse',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/jiangnan/scholar-ji',
        roomId: 'area/jiangnan/main-canal',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/jiangnan/boatman-lao',
        roomId: 'area/jiangnan/east-dock',
        count: 1,
        interval: 0,
      },
    ]);
    this.set('item_spawn_rules', []);
  }
}
