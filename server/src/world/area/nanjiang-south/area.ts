/**
 * 雾岚寨 — 区域定义
 * 苗疆山顶木寨，常年云雾缭绕，外人不经引荐不得入内
 */
import { Area } from '../../../engine/game-objects/area';

export default class NanjiangSouthArea extends Area {
  static virtual = true;

  create() {
    this.set('name', '雾岚寨');
    this.set('description', '苗疆山顶木寨，常年云雾缭绕，外人不经引荐不得入内');
    this.set('region', '西南·蛮疆');
    this.set('level_range', { min: 8, max: 14 });
    this.set('rooms', [
      // 寨门区
      'area/nanjiang-south/zhai-gate',
      'area/nanjiang-south/watchtower',
      'area/nanjiang-south/hunting-camp',
      'area/nanjiang-south/bamboo-houses',
      // 寨内核心区
      'area/nanjiang-south/zhai-square',
      'area/nanjiang-south/council-hall',
      'area/nanjiang-south/herb-hut',
      'area/nanjiang-south/drying-yard',
      // 西区·工艺区
      'area/nanjiang-south/silversmith',
      'area/nanjiang-south/dyeing-workshop',
      // 祭祀区
      'area/nanjiang-south/spirit-tree',
      'area/nanjiang-south/altar',
      'area/nanjiang-south/lusheng-terrace',
      'area/nanjiang-south/gu-room',
      'area/nanjiang-south/gu-cave',
      // 南区·边界
      'area/nanjiang-south/south-boundary',
      // 山林区
      'area/nanjiang-south/forest-path',
      'area/nanjiang-south/deep-forest',
      'area/nanjiang-south/cliff-path',
      'area/nanjiang-south/waterfall-pool',
      // 深处秘境
      'area/nanjiang-south/poison-valley',
      'area/nanjiang-south/ancestor-tomb',
    ]);
    this.set('spawn_rules', [
      // 核心 NPC
      {
        blueprintId: 'npc/nanjiang-south/baimanvillage-elder',
        roomId: 'area/nanjiang-south/zhai-square',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/nanjiang-south/young-chief',
        roomId: 'area/nanjiang-south/zhai-square',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/nanjiang-south/witch-doctor',
        roomId: 'area/nanjiang-south/spirit-tree',
        count: 1,
        interval: 0,
      },
      // 扩展 NPC
      {
        blueprintId: 'npc/nanjiang-south/hunter-kuiwa',
        roomId: 'area/nanjiang-south/hunting-camp',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/nanjiang-south/weaver-aniu',
        roomId: 'area/nanjiang-south/dyeing-workshop',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/nanjiang-south/elder-gupo',
        roomId: 'area/nanjiang-south/council-hall',
        count: 1,
        interval: 0,
      },
    ]);
    this.set('item_spawn_rules', []);
  }
}
