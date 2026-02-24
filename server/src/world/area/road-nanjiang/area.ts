/**
 * 山路·蛮疆段 — 区域定义
 * 中原通往蛮疆苗疆的山路，官道断裂后只剩山民踩出的小径
 */
import { Area } from '../../../engine/game-objects/area';

export default class RoadNanjiangArea extends Area {
  static virtual = true;

  create() {
    this.set('name', '山路·蛮疆段');
    this.set('description', '中原通往蛮疆苗疆的山路，官道断裂后只剩山民踩出的小径');
    this.set('region', '西南·山路');
    this.set('level_range', { min: 8, max: 14 });
    this.set('rooms', [
      'area/road-nanjiang/north-end',
      'area/road-nanjiang/bamboo-path',
      'area/road-nanjiang/creek-trail',
      'area/road-nanjiang/vine-bridge',
      'area/road-nanjiang/miasma-woods',
      'area/road-nanjiang/mist-valley',
      'area/road-nanjiang/rocky-slope',
      'area/road-nanjiang/hunter-shed',
      'area/road-nanjiang/south-end',
    ]);
    this.set('spawn_rules', [
      {
        blueprintId: 'npc/road-nanjiang/jungle-beast',
        roomId: 'area/road-nanjiang/mist-valley',
        count: 2,
        interval: 60000,
      },
      {
        blueprintId: 'npc/road-nanjiang/poison-snake',
        roomId: 'area/road-nanjiang/bamboo-path',
        count: 1,
        interval: 60000,
      },
      {
        blueprintId: 'npc/road-nanjiang/mountain-viper',
        roomId: 'area/road-nanjiang/rocky-slope',
        count: 2,
        interval: 60000,
      },
      {
        blueprintId: 'npc/road-nanjiang/miao-hunter',
        roomId: 'area/road-nanjiang/hunter-shed',
        count: 1,
        interval: 60000,
      },
    ]);
    this.set('item_spawn_rules', []);
  }
}
