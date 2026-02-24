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
      // 驿站入口
      'area/western-wastes/east-gate',
      'area/western-wastes/stable',
      // 集市核心区
      'area/western-wastes/bazaar',
      'area/western-wastes/spice-stall',
      'area/western-wastes/silk-shop',
      'area/western-wastes/weapon-stall',
      'area/western-wastes/curio-shop',
      'area/western-wastes/money-changer',
      // 驿馆区
      'area/western-wastes/caravansary',
      'area/western-wastes/kitchen',
      'area/western-wastes/irrigation-canal',
      // 宗教区
      'area/western-wastes/meditation-tent',
      'area/western-wastes/sutra-hall',
      'area/western-wastes/star-ruins',
      'area/western-wastes/ascetic-cliff',
      'area/western-wastes/guard-post',
      // 绿洲区
      'area/western-wastes/palm-grove',
      'area/western-wastes/oasis-lake',
      // 沙漠边缘
      'area/western-wastes/well',
      'area/western-wastes/dune-lookout',
      'area/western-wastes/abandoned-camp',
      'area/western-wastes/sand-cave',
    ]);
    this.set('spawn_rules', [
      // 核心 NPC
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
      // 商人
      {
        blueprintId: 'npc/western-wastes/spice-merchant',
        roomId: 'area/western-wastes/spice-stall',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/western-wastes/silk-merchant',
        roomId: 'area/western-wastes/silk-shop',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/western-wastes/weapon-smith',
        roomId: 'area/western-wastes/weapon-stall',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/western-wastes/money-changer-npc',
        roomId: 'area/western-wastes/money-changer',
        count: 1,
        interval: 0,
      },
      // 驿馆
      {
        blueprintId: 'npc/western-wastes/innkeeper-zara',
        roomId: 'area/western-wastes/caravansary',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/western-wastes/camel-driver',
        roomId: 'area/western-wastes/stable',
        count: 1,
        interval: 0,
      },
      // 宗教
      {
        blueprintId: 'npc/western-wastes/monk-apprentice',
        roomId: 'area/western-wastes/sutra-hall',
        count: 1,
        interval: 0,
      },
      // 中立
      {
        blueprintId: 'npc/western-wastes/info-broker',
        roomId: 'area/western-wastes/curio-shop',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/western-wastes/wandering-swordsman',
        roomId: 'area/western-wastes/oasis-lake',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/western-wastes/desert-traveler',
        roomId: 'area/western-wastes/caravansary',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/western-wastes/desert-guard',
        roomId: 'area/western-wastes/guard-post',
        count: 1,
        interval: 0,
      },
      // 敌对
      {
        blueprintId: 'npc/western-wastes/sand-bandit',
        roomId: 'area/western-wastes/abandoned-camp',
        count: 1,
        interval: 120000,
      },
      {
        blueprintId: 'npc/western-wastes/sand-bandit',
        roomId: 'area/western-wastes/dune-lookout',
        count: 1,
        interval: 120000,
      },
      {
        blueprintId: 'npc/western-wastes/sand-scorpion',
        roomId: 'area/western-wastes/sand-cave',
        count: 1,
        interval: 120000,
      },
    ]);
    this.set('item_spawn_rules', []);
  }
}
