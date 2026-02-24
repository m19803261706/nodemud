/**
 * 烟雨镇 — 区域定义
 * 江南水乡小镇，表面宁静，暗流涌动
 * 22 间房 + 13 个 NPC，等级范围 6-12
 */
import { Area } from '../../../engine/game-objects/area';

export default class JiangnanArea extends Area {
  static virtual = true;

  create() {
    this.set('name', '烟雨镇');
    this.set('description', '江南水乡小镇，表面宁静，暗流涌动');
    this.set('region', '东南·江南');
    this.set('level_range', { min: 6, max: 12 });
    this.set('rooms', [
      // === 北岸·文化区 ===
      'area/jiangnan/poem-gallery', // 诗碑廊 (0,-2)
      'area/jiangnan/academy', // 青莲书院 (1,-2)
      'area/jiangnan/music-hall', // 清音琴馆 (2,-2)
      'area/jiangnan/waterside-house', // 水边人家 (0,-1)
      'area/jiangnan/teahouse', // 听雨茶楼 (1,-1)
      'area/jiangnan/silk-shop', // 锦绣绸缎庄 (2,-1)
      // === 运河主街 ===
      'area/jiangnan/west-dock', // 西码头 (0,0)
      'area/jiangnan/main-canal', // 运河街 (1,0)
      'area/jiangnan/east-dock', // 东码头 (2,0)
      // === 南岸·画桥区 ===
      'area/jiangnan/fishing-village', // 渔村 (0,1)
      'area/jiangnan/stone-bridge', // 画桥 (1,1)
      'area/jiangnan/bridge-pavilion', // 桥畔亭 (1,1,1)
      'area/jiangnan/boatyard', // 船坞 (2,1)
      // === 南街·商业区 ===
      'area/jiangnan/ancestral-hall', // 沈氏祠堂 (0,2)
      'area/jiangnan/south-street', // 南街 (1,2)
      'area/jiangnan/warehouse', // 河畔仓库 (2,2)
      'area/jiangnan/escort-office', // 顺风镖局 (0,3)
      'area/jiangnan/herb-shop', // 济世药铺 (1,3)
      'area/jiangnan/pawn-shop', // 万通当铺 (2,3)
      'area/jiangnan/tavern', // 望江酒楼 (1,4)
      // === 暗区 ===
      'area/jiangnan/dock-alley', // 码头巷 (1,5)
      'area/jiangnan/dark-alley', // 暗巷 (2,5)
      'area/jiangnan/underground-passage', // 水下暗道 (2,5,-1)
    ]);
    this.set('spawn_rules', [
      // === 友好 NPC（常驻） ===
      {
        blueprintId: 'npc/jiangnan/teahouse-gu',
        roomId: 'area/jiangnan/teahouse',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/jiangnan/scholar-ji',
        roomId: 'area/jiangnan/main-canal',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/jiangnan/boatman-lao',
        roomId: 'area/jiangnan/east-dock',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/jiangnan/academy-master',
        roomId: 'area/jiangnan/academy',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/jiangnan/music-master',
        roomId: 'area/jiangnan/music-hall',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/jiangnan/silk-merchant',
        roomId: 'area/jiangnan/silk-shop',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/jiangnan/fisherman-chen',
        roomId: 'area/jiangnan/fishing-village',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/jiangnan/herbalist-sun',
        roomId: 'area/jiangnan/herb-shop',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/jiangnan/tavern-keeper',
        roomId: 'area/jiangnan/tavern',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/jiangnan/escort-chief',
        roomId: 'area/jiangnan/escort-office',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/jiangnan/shipwright-ma',
        roomId: 'area/jiangnan/boatyard',
        count: 1,
        interval: 0,
      },
      // === 中立 NPC（常驻） ===
      {
        blueprintId: 'npc/jiangnan/pawnbroker-qian',
        roomId: 'area/jiangnan/pawn-shop',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/jiangnan/wandering-swordsman',
        roomId: 'area/jiangnan/stone-bridge',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/jiangnan/smuggler-liu',
        roomId: 'area/jiangnan/underground-passage',
        count: 1,
        interval: 0,
      },
      // === 敌对 NPC（可重生） ===
      {
        blueprintId: 'npc/jiangnan/water-bandit',
        roomId: 'area/jiangnan/dock-alley',
        count: 1,
        interval: 120000,
      },
      {
        blueprintId: 'npc/jiangnan/dark-alley-thug',
        roomId: 'area/jiangnan/dark-alley',
        count: 1,
        interval: 120000,
      },
      {
        blueprintId: 'npc/jiangnan/water-bandit-chief',
        roomId: 'area/jiangnan/warehouse',
        count: 1,
        interval: 120000,
      },
    ]);
    this.set('item_spawn_rules', []);
  }
}
