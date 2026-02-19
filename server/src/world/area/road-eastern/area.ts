/**
 * 海路·东海段 — 区域定义
 * 从烟雨镇通往潮汐港的沿海路段，盐风腥味，野怪出没
 */
import { Area } from '../../../engine/game-objects/area';

export default class RoadEasternArea extends Area {
  static virtual = true;

  create() {
    this.set('name', '海路·东海段');
    this.set('description', '从烟雨镇通往潮汐港的沿海路段');
    this.set('region', '东海·沿海');
    this.set('level_range', { min: 8, max: 14 });
    this.set('rooms', [
      'area/road-eastern/west-end',
      'area/road-eastern/coastal-road',
      'area/road-eastern/sea-cliff',
      'area/road-eastern/reef-path',
    ]);
    this.set('spawn_rules', [
      {
        blueprintId: 'npc/road-eastern/sea-creature',
        roomId: 'area/road-eastern/reef-path',
        count: 1,
        interval: 60000,
      },
      {
        blueprintId: 'npc/road-eastern/pirate-scout',
        roomId: 'area/road-eastern/sea-cliff',
        count: 1,
        interval: 60000,
      },
    ]);
    this.set('item_spawn_rules', []);
  }
}
