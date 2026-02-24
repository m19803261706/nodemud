/**
 * 朔云关 — 区域定义
 * 北境边关要塞，抵御外族入侵的最后防线
 * 22 间房，15 个 NPC
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
      // 南门区域
      'area/frost-pass/shrine',
      'area/frost-pass/tavern',
      'area/frost-pass/south-gate',
      'area/frost-pass/supply-depot',
      'area/frost-pass/gate-market',
      // 关城主街
      'area/frost-pass/kitchen',
      'area/frost-pass/watchtower',
      'area/frost-pass/main-street',
      'area/frost-pass/armory',
      'area/frost-pass/warehouse',
      // 军事核心区
      'area/frost-pass/west-tower',
      'area/frost-pass/training-ground',
      'area/frost-pass/fortress-hall',
      'area/frost-pass/infirmary',
      // 城墙与营帐
      'area/frost-pass/stable',
      'area/frost-pass/north-wall',
      'area/frost-pass/war-camp',
      'area/frost-pass/east-wall',
      'area/frost-pass/east-tower',
      // 北门与关外
      'area/frost-pass/north-gate',
      'area/frost-pass/outpost',
      // 地下
      'area/frost-pass/dungeon',
      'area/frost-pass/smuggler-tunnel',
    ]);
    this.set('spawn_rules', [
      // === 友好 NPC（interval: 0，永久存在）===
      {
        blueprintId: 'npc/frost-pass/border-captain',
        roomId: 'area/frost-pass/fortress-hall',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/frost-pass/blacksmith-fan',
        roomId: 'area/frost-pass/armory',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/frost-pass/spy-yan',
        roomId: 'area/frost-pass/watchtower',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/frost-pass/military-doctor',
        roomId: 'area/frost-pass/infirmary',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/frost-pass/drill-sergeant',
        roomId: 'area/frost-pass/training-ground',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/frost-pass/supply-officer',
        roomId: 'area/frost-pass/supply-depot',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/frost-pass/tavern-keeper',
        roomId: 'area/frost-pass/tavern',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/frost-pass/old-veteran',
        roomId: 'area/frost-pass/war-camp',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/frost-pass/stable-hand',
        roomId: 'area/frost-pass/stable',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/frost-pass/cook-wang',
        roomId: 'area/frost-pass/kitchen',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/frost-pass/gate-merchant',
        roomId: 'area/frost-pass/gate-market',
        count: 1,
        interval: 0,
      },
      // === 中立 NPC（interval: 0，永久存在）===
      {
        blueprintId: 'npc/frost-pass/smuggler',
        roomId: 'area/frost-pass/smuggler-tunnel',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/frost-pass/deserter',
        roomId: 'area/frost-pass/west-tower',
        count: 1,
        interval: 0,
      },
      // === 城墙守卒（友好，永久存在，多个位置）===
      {
        blueprintId: 'npc/frost-pass/wall-guard',
        roomId: 'area/frost-pass/north-wall',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/frost-pass/wall-guard',
        roomId: 'area/frost-pass/east-wall',
        count: 1,
        interval: 0,
      },
      // === 敌对 NPC（interval: 120000，死后 2 分钟重生）===
      {
        blueprintId: 'npc/frost-pass/nomad-scout',
        roomId: 'area/frost-pass/outpost',
        count: 1,
        interval: 120000,
      },
      {
        blueprintId: 'npc/frost-pass/nomad-warrior',
        roomId: 'area/frost-pass/outpost',
        count: 1,
        interval: 120000,
      },
      // === 被囚 NPC（敌对但被囚禁，永久存在）===
      {
        blueprintId: 'npc/frost-pass/spy-prisoner',
        roomId: 'area/frost-pass/dungeon',
        count: 1,
        interval: 0,
      },
    ]);
    this.set('item_spawn_rules', []);
  }
}
