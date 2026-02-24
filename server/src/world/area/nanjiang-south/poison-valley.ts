/**
 * 雾岚寨·毒雾谷 — 瘴气弥漫的危险区域
 * 坐标: (0, 5, 0)
 * 充满毒雾的山谷，高等级敌对区域
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class NanjiangSouthPoisonValley extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '雾岚寨·毒雾谷');
    this.set(
      'long',
      '栈道尽头，地势骤然下沉，形成一个狭长的山谷。' +
        '谷中弥漫着浓重的紫灰色雾气，贴着地面缓缓流动，' +
        '像是活物一样蜿蜒盘旋。雾气中带着一种刺鼻的甜腐味，' +
        '闻久了会觉得头昏眼花。' +
        '谷壁两侧长满了色彩异常鲜艳的花朵——大红、明黄、靛紫，' +
        '越是好看的越是剧毒，这是南疆山林不成文的规矩。' +
        '地面湿滑，长满了褐色的菌类，踩上去会发出噗嗤的声响，' +
        '释放出一团细小的孢子。' +
        '谷深处隐约可见几块巨大的岩石，岩石上攀附着粗壮的藤蔓，' +
        '藤蔓的根部盘绕在一起，形成一个洞口的形状。',
    );
    this.set('coordinates', { x: 0, y: 5, z: 0 });
    this.set('exits', {
      north: 'area/nanjiang-south/cliff-path',
      south: 'area/nanjiang-south/ancestor-tomb',
    });
  }
}
