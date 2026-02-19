/**
 * 官道·北境段 — 区域定义
 * 中原通往北境霜疆的漫长官道，越走越荒凉
 */
import { Area } from '../../../engine/game-objects/area';

export default class RoadNorthArea extends Area {
  static virtual = true;

  create() {
    this.set('name', '官道·北境段');
    this.set('description', '中原通往北境霜疆的漫长官道，越走越荒凉');
    this.set('region', '北境·官道');
    this.set('level_range', { min: 5, max: 10 });
    this.set('rooms', [
      'area/road-north/south-end',
      'area/road-north/wind-pass',
      'area/road-north/frozen-trail',
      'area/road-north/grassland',
      'area/road-north/north-end',
    ]);
    this.set('spawn_rules', [
      {
        blueprintId: 'npc/road-north/wolf',
        roomId: 'area/road-north/frozen-trail',
        count: 2,
        interval: 60000,
      },
      {
        blueprintId: 'npc/road-north/steppe-raider',
        roomId: 'area/road-north/grassland',
        count: 1,
        interval: 90000,
      },
    ]);
    this.set('item_spawn_rules', []);
  }
}
