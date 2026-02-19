/**
 * 官道·中原段 — 区域定义
 * 裂隙镇南门外通往中原腹地的黄土官道，衔接裂谷与洛阳废都
 */
import { Area } from '../../../engine/game-objects/area';

export default class RoadCentralArea extends Area {
  static virtual = true;

  create() {
    this.set('name', '官道·中原段');
    this.set('description', '裂隙镇南门外通往中原腹地的黄土官道');
    this.set('region', '中原·官道');
    this.set('level_range', { min: 3, max: 6 });
    this.set('rooms', [
      'area/road-central/north-end',
      'area/road-central/dusty-road',
      'area/road-central/old-bridge',
      'area/road-central/crossroads',
      'area/road-central/south-end',
    ]);
    this.set('spawn_rules', [
      {
        blueprintId: 'npc/road-central/road-bandit',
        roomId: 'area/road-central/dusty-road',
        count: 2,
        interval: 60000,
      },
      {
        blueprintId: 'npc/road-central/road-bandit',
        roomId: 'area/road-central/old-bridge',
        count: 1,
        interval: 60000,
      },
    ]);
    this.set('item_spawn_rules', []);
  }
}
