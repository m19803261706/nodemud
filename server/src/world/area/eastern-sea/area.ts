/**
 * 潮汐港 — 区域定义
 * 半合法港口半海盗窝，没有一面官方旗帜
 */
import { Area } from '../../../engine/game-objects/area';

export default class EasternSeaArea extends Area {
  static virtual = true;

  create() {
    this.set('name', '潮汐港');
    this.set('description', '半合法港口半海盗窝，没有一面官方旗帜');
    this.set('region', '东海·岛屿');
    this.set('level_range', { min: 15, max: 22 });
    this.set('rooms', [
      'area/eastern-sea/harbor-gate',
      'area/eastern-sea/harbor-square',
      'area/eastern-sea/wharf',
      'area/eastern-sea/harbor-inn',
    ]);
    this.set('spawn_rules', [
      {
        blueprintId: 'npc/eastern-sea/harbor-master',
        roomId: 'area/eastern-sea/harbor-square',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/eastern-sea/immortal-ling',
        roomId: 'area/eastern-sea/wharf',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/eastern-sea/doctor-qiu',
        roomId: 'area/eastern-sea/harbor-inn',
        count: 1,
        interval: 0,
      },
    ]);
    this.set('item_spawn_rules', []);
  }
}
