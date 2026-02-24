/**
 * 洛阳废都 — 区域定义
 * 昔日天下第一城，门派倾覆后的废墟，政治真空引各方蜂拥
 * 24 间房间 + 15 NPC
 */
import { Area } from '../../../engine/game-objects/area';

export default class CentralPlainArea extends Area {
  static virtual = true;

  create() {
    this.set('name', '洛阳废都');
    this.set('description', '昔日天下第一城，门派倾覆后的废墟，政治真空引各方蜂拥');
    this.set('region', '中原·腹地');
    this.set('level_range', { min: 5, max: 12 });
    this.set('rooms', [
      // 核心区（已有）
      'area/central-plain/north-gate',
      'area/central-plain/ruins-square',
      'area/central-plain/old-tavern',
      'area/central-plain/broken-hall',
      // 北区·军事区
      'area/central-plain/governor-mansion',
      'area/central-plain/guard-barracks',
      'area/central-plain/watchtower',
      'area/central-plain/arena-ruins',
      // 城墙
      'area/central-plain/collapsed-tower',
      'area/central-plain/patrol-road',
      'area/central-plain/east-wall',
      'area/central-plain/west-wall',
      // 西区·市井区
      'area/central-plain/market-ruins',
      'area/central-plain/blacksmith-alley',
      'area/central-plain/refugee-camp',
      // 东区·权贵区
      'area/central-plain/noble-quarter',
      'area/central-plain/old-library',
      // 南区
      'area/central-plain/south-avenue',
      'area/central-plain/south-gate',
      'area/central-plain/temple-ruins',
      'area/central-plain/meditation-garden',
      'area/central-plain/underground-entrance',
      // 地下层
      'area/central-plain/well-bottom',
      'area/central-plain/hidden-cellar',
    ]);
    this.set('spawn_rules', [
      // 核心区 NPC（已有）
      {
        blueprintId: 'npc/central-plain/xie-wenyuan',
        roomId: 'area/central-plain/ruins-square',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/central-plain/merchant-liu',
        roomId: 'area/central-plain/old-tavern',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/central-plain/city-guard',
        roomId: 'area/central-plain/north-gate',
        count: 1,
        interval: 300000,
      },
      // 北区 NPC
      {
        blueprintId: 'npc/central-plain/governor-aide',
        roomId: 'area/central-plain/governor-mansion',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/central-plain/arena-keeper',
        roomId: 'area/central-plain/arena-ruins',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/central-plain/deserter',
        roomId: 'area/central-plain/collapsed-tower',
        count: 1,
        interval: 120000,
      },
      {
        blueprintId: 'npc/central-plain/wild-dog',
        roomId: 'area/central-plain/west-wall',
        count: 2,
        interval: 90000,
      },
      {
        blueprintId: 'npc/central-plain/wild-dog',
        roomId: 'area/central-plain/east-wall',
        count: 2,
        interval: 90000,
      },
      // 南区 NPC
      {
        blueprintId: 'npc/central-plain/old-monk',
        roomId: 'area/central-plain/temple-ruins',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/central-plain/fortune-teller',
        roomId: 'area/central-plain/meditation-garden',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/central-plain/underground-guide',
        roomId: 'area/central-plain/underground-entrance',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/central-plain/city-rat',
        roomId: 'area/central-plain/well-bottom',
        count: 2,
        interval: 60000,
      },
      {
        blueprintId: 'npc/central-plain/city-rat',
        roomId: 'area/central-plain/hidden-cellar',
        count: 2,
        interval: 60000,
      },
      // 东西区 NPC
      {
        blueprintId: 'npc/central-plain/blacksmith-zhao',
        roomId: 'area/central-plain/blacksmith-alley',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/central-plain/refugee-leader',
        roomId: 'area/central-plain/refugee-camp',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/central-plain/ruin-thief',
        roomId: 'area/central-plain/noble-quarter',
        count: 2,
        interval: 120000,
      },
      {
        blueprintId: 'npc/central-plain/librarian',
        roomId: 'area/central-plain/old-library',
        count: 1,
        interval: 300000,
      },
    ]);
    this.set('item_spawn_rules', []);
  }
}
