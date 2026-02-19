/**
 * 朔云关 — 区域定义
 * 北境边关要塞，抵御外族入侵的最后防线
 */
import { Area } from '../../../engine/game-objects/area';

export default class FrostPassArea extends Area {
  static virtual = true;

  create() {
    this.set('name', '朔云关');
    this.set('description', '北境边关要塞，抵御外族入侵的最后防线');
    this.set('region', '北境·霜疆');
    this.set('level_range', { min: 6, max: 12 });
    this.set('rooms', [
      'area/frost-pass/south-gate',
      'area/frost-pass/main-street',
      'area/frost-pass/fortress-hall',
      'area/frost-pass/armory',
      'area/frost-pass/watchtower',
    ]);
    this.set('spawn_rules', [
      {
        blueprintId: 'npc/frost-pass/border-captain',
        roomId: 'area/frost-pass/fortress-hall',
        count: 1,
        interval: 120000,
      },
      {
        blueprintId: 'npc/frost-pass/blacksmith-fan',
        roomId: 'area/frost-pass/armory',
        count: 1,
        interval: 120000,
      },
      {
        blueprintId: 'npc/frost-pass/spy-yan',
        roomId: 'area/frost-pass/watchtower',
        count: 1,
        interval: 120000,
      },
    ]);
    this.set('item_spawn_rules', []);
  }
}
