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
      'area/songyang/mountain-path',
      'area/songyang/gate',
      'area/songyang/drill-ground',
      'area/songyang/hall',
    ]);

    this.set('spawn_rules', [
      {
        blueprintId: 'npc/songyang/master-li',
        roomId: 'area/songyang/hall',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/songyang/deacon-zhao',
        roomId: 'area/songyang/hall',
        count: 1,
        interval: 300000,
      },
      {
        blueprintId: 'npc/songyang/sparring-disciple',
        roomId: 'area/songyang/drill-ground',
        count: 1,
        interval: 300000,
      },
    ]);

    this.set('item_spawn_rules', []);
  }
}
