/**
 * 嵩阳宗 — 区域定义
 * 新手可抵达的门派试点区域
 */
import { Area } from '../../../engine/game-objects/area';

export default class SongyangArea extends Area {
  static virtual = true;

  create() {
    this.set('name', '嵩阳宗');
    this.set('description', '中原正道宗门，门规森严，重心法与根骨并修。');
    this.set('region', '中原·嵩山');
    this.set('level_range', { min: 3, max: 15 });
    this.set('rooms', [
      // 宗门核心区
      'area/songyang/master-retreat',
      'area/songyang/practice-cliff',
      'area/songyang/tianyan-stele',
      'area/songyang/meditation-room',
      'area/songyang/scripture-pavilion',
      'area/songyang/hall',
      'area/songyang/deacon-court',
      'area/songyang/discipline-hall',
      'area/songyang/disciples-yard',
      'area/songyang/herb-garden',
      'area/songyang/gate',
      'area/songyang/drill-ground',
      'area/songyang/armory',
      // 嵩阳山道
      'area/songyang/mountain-path',
      'area/songyang/pine-pavilion',
      'area/songyang/mountain-path-middle',
      'area/songyang/mountain-stream',
      'area/songyang/rocky-slope',
      'area/songyang/mountain-path-lower',
      // 官道
      'area/songyang/road-songshan',
      'area/songyang/road-rift',
    ]);

    this.set('spawn_rules', [
      // 宗门核心 NPC
      {
        blueprintId: 'npc/songyang/master-li',
        roomId: 'area/songyang/hall',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/songyang/deacon-zhao',
        roomId: 'area/songyang/deacon-court',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/songyang/sparring-disciple',
        roomId: 'area/songyang/drill-ground',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/songyang/elder-xu',
        roomId: 'area/songyang/meditation-room',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/songyang/discipline-elder-lu',
        roomId: 'area/songyang/disciples-yard',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/songyang/senior-disciple-lin',
        roomId: 'area/songyang/drill-ground',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/songyang/mentor-he',
        roomId: 'area/songyang/disciples-yard',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/songyang/gate-disciple',
        roomId: 'area/songyang/mountain-path',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/songyang/gate-disciple',
        roomId: 'area/songyang/gate',
        count: 1,
        interval: 300000,
      },
      // 新增 NPC
      {
        blueprintId: 'npc/songyang/herb-disciple',
        roomId: 'area/songyang/herb-garden',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/songyang/patrol-disciple',
        roomId: 'area/songyang/pine-pavilion',
        count: 1,
        interval: 300000,
      },
      // 野怪
      {
        blueprintId: 'npc/songyang/mountain-bandit',
        roomId: 'area/songyang/rocky-slope',
        count: 2,
        interval: 60000,
      },
      {
        blueprintId: 'npc/songyang/bandit-leader',
        roomId: 'area/songyang/rocky-slope',
        count: 1,
        interval: 120000,
      },
      {
        blueprintId: 'npc/songyang/wild-wolf',
        roomId: 'area/songyang/mountain-stream',
        count: 2,
        interval: 60000,
      },
    ]);

    this.set('item_spawn_rules', []);
  }
}
