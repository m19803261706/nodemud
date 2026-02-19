/**
 * 丝路·西域段 — 区域定义
 * 中原通往西域荒漠的丝绸之路，黄沙漫道，强盗横行
 */
import { Area } from '../../../engine/game-objects/area';

export default class RoadWesternArea extends Area {
  static virtual = true;

  create() {
    this.set('name', '丝路·西域段');
    this.set('description', '中原通往西域荒漠的丝绸之路，黄沙漫道，强盗横行');
    this.set('region', '西域·丝路');
    this.set('level_range', { min: 10, max: 18 });
    this.set('rooms', [
      'area/road-western/east-end',
      'area/road-western/dusty-wasteland',
      'area/road-western/sandstorm-pass',
      'area/road-western/oasis-ruin',
      'area/road-western/west-end',
    ]);
    this.set('spawn_rules', [
      {
        blueprintId: 'npc/road-western/desert-bandit',
        roomId: 'area/road-western/dusty-wasteland',
        count: 2,
        interval: 60000,
      },
      {
        blueprintId: 'npc/road-western/sand-scorpion',
        roomId: 'area/road-western/oasis-ruin',
        count: 1,
        interval: 60000,
      },
    ]);
    this.set('item_spawn_rules', []);
  }
}
