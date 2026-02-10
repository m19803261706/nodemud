/**
 * 裂隙镇 — 区域定义
 * 天裂后形成的裂谷中的中立小镇，各方势力的交汇之地
 */
import { Area } from '../../../engine/game-objects/area';

export default class RiftTownArea extends Area {
  static virtual = true;

  create() {
    this.set('name', '裂隙镇');
    this.set('description', '天裂后形成的裂谷中的中立小镇，各方势力的交汇之地');
    this.set('region', '中原·裂谷地带');
    this.set('level_range', { min: 1, max: 5 });
    this.set('rooms', [
      'area/rift-town/square',
      'area/rift-town/north-street',
      'area/rift-town/south-street',
      'area/rift-town/tavern',
      'area/rift-town/inn',
      'area/rift-town/herb-shop',
      'area/rift-town/smithy',
      'area/rift-town/notice-board',
      'area/rift-town/general-store',
      'area/rift-town/north-road',
      'area/rift-town/south-road',
      'area/rift-town/north-gate',
      'area/rift-town/south-gate',
      'area/rift-town/underground',
    ]);

    // NPC 刷新规则
    this.set('spawn_rules', [
      {
        blueprintId: 'npc/rift-town/town-elder',
        roomId: 'area/rift-town/square',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/rift-town/bartender',
        roomId: 'area/rift-town/tavern',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/rift-town/mysterious-traveler',
        roomId: 'area/rift-town/tavern',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/rift-town/innkeeper',
        roomId: 'area/rift-town/inn',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/rift-town/herbalist',
        roomId: 'area/rift-town/herb-shop',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/rift-town/blacksmith',
        roomId: 'area/rift-town/smithy',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/rift-town/merchant',
        roomId: 'area/rift-town/general-store',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/rift-town/old-beggar',
        roomId: 'area/rift-town/south-street',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/rift-town/north-guard',
        roomId: 'area/rift-town/north-gate',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/rift-town/south-guard',
        roomId: 'area/rift-town/south-gate',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/rift-town/bandit',
        roomId: 'area/rift-town/north-road',
        // 任务怪提高基线数量并缩短重生时间，支持多人并发完成新手任务
        count: 3,
        interval: 45000,
      },
    ]);

    // 物品刷新规则
    this.set('item_spawn_rules', [
      {
        blueprintId: 'item/rift-town/iron-sword',
        roomId: 'area/rift-town/smithy',
        count: 1,
        interval: 600000,
      },
      {
        blueprintId: 'item/rift-town/wooden-staff',
        roomId: 'area/rift-town/north-road',
        count: 1,
        interval: 600000,
      },
      {
        blueprintId: 'item/rift-town/cloth-armor',
        roomId: 'area/rift-town/general-store',
        count: 1,
        interval: 600000,
      },
      {
        blueprintId: 'item/rift-town/golden-salve',
        roomId: 'area/rift-town/herb-shop',
        count: 1,
        interval: 600000,
      },
      {
        blueprintId: 'item/rift-town/dry-rations',
        roomId: 'area/rift-town/inn',
        count: 1,
        interval: 600000,
      },
      {
        blueprintId: 'item/rift-town/small-pouch',
        roomId: 'area/rift-town/general-store',
        count: 1,
        interval: 600000,
      },
      {
        blueprintId: 'item/rift-town/basic-sword-page',
        roomId: 'area/rift-town/tavern',
        count: 1,
        interval: 600000,
      },
    ]);
  }
}
