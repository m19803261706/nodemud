/**
 * 黄沙驿 — 区域定义
 * 丝路上唯一的绿洲驿站，各国商人密宗僧侣混居
 */
import { Area } from '../../../engine/game-objects/area';

export default class WesternWastesArea extends Area {
  static virtual = true;

  create() {
    this.set('name', '黄沙驿');
    this.set('description', '丝路上唯一的绿洲驿站，各国商人密宗僧侣混居');
    this.set('region', '西域·荒原');
    this.set('level_range', { min: 10, max: 18 });
    this.set('rooms', [
      'area/western-wastes/east-gate',
      'area/western-wastes/bazaar',
      'area/western-wastes/meditation-tent',
    ]);
    this.set('spawn_rules', [
      {
        blueprintId: 'npc/western-wastes/station-master',
        roomId: 'area/western-wastes/bazaar',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/western-wastes/monk-dharma',
        roomId: 'area/western-wastes/meditation-tent',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/western-wastes/relic-trader',
        roomId: 'area/western-wastes/bazaar',
        count: 1,
        interval: 0,
      },
    ]);
    this.set('item_spawn_rules', []);
  }
}
