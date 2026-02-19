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
      'area/nanjiang-south/zhai-gate',
      'area/nanjiang-south/zhai-square',
      'area/nanjiang-south/herb-hut',
      'area/nanjiang-south/spirit-tree',
      'area/nanjiang-south/south-boundary',
    ]);
    this.set('spawn_rules', [
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
    ]);
    this.set('item_spawn_rules', []);
  }
}
