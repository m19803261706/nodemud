/**
 * 洛阳废都 — 区域定义
 * 昔日天下第一城，门派倾覆后的废墟，政治真空引各方蜂拥
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
      'area/central-plain/north-gate',
      'area/central-plain/ruins-square',
      'area/central-plain/old-tavern',
      'area/central-plain/broken-hall',
    ]);
    this.set('spawn_rules', [
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
    ]);
    this.set('item_spawn_rules', []);
  }
}
