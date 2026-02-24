/**
 * 山路·瘴气密林 — 蛮疆山路
 * 坐标: (0, 4, 0)
 * 林深雾重，瘴气弥漫，空气中弥漫着腐朽和药草的气味
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadNanjiangMiasmaWoods extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '山路·瘴气密林');
    this.set(
      'long',
      '过了藤桥便陷入一片浓密的原始林，树冠层层叠叠，遮得天无日头。' +
        '空气黏稠而闷热，带着一股甜腻的腐朽味，那是落叶和菌菇在潮湿中发酵的气息。' +
        '林间飘着一缕缕淡黄色的薄雾，山民管这叫「瘴」，' +
        '吸多了头晕目眩，严重的能让人几天起不来身。' +
        '小径两旁的树干上攀满了寄生的藤蔓和苔藓，有些菌伞大得像斗笠，' +
        '颜色鲜艳得不正常——越好看的东西越碰不得，这是蛮疆的规矩。',
    );
    this.set('coordinates', { x: 0, y: 4, z: 0 });
    this.set('exits', {
      north: 'area/road-nanjiang/vine-bridge',
      south: 'area/road-nanjiang/mist-valley',
    });
  }
}
