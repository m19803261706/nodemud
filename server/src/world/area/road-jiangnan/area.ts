/**
 * 水路·江南段 — 区域定义
 * 连接中原官道与烟雨镇的江南水路，青石板路、垂柳与烟雨意境
 */
import { Area } from '../../../engine/game-objects/area';

export default class RoadJiangnanArea extends Area {
  static virtual = true;

  create() {
    this.set('name', '水路·江南段');
    this.set('description', '连接中原官道与烟雨镇的江南水路');
    this.set('region', '东南·官道');
    this.set('level_range', { min: 8, max: 12 });
    this.set('rooms', [
      'area/road-jiangnan/west-end',
      'area/road-jiangnan/willow-road',
      'area/road-jiangnan/misty-bridge',
      'area/road-jiangnan/lotus-lake',
      'area/road-jiangnan/east-end',
    ]);
    this.set('spawn_rules', [
      {
        blueprintId: 'npc/road-jiangnan/lake-bandit',
        roomId: 'area/road-jiangnan/willow-road',
        count: 2,
        interval: 60000,
      },
    ]);
    this.set('item_spawn_rules', []);
  }
}
