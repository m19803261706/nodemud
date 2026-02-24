/**
 * 丝路·戈壁荒滩 — 西域丝路
 * 坐标: (-1, 0, 0)
 * 寸草不生的戈壁滩，碎石铺地，天地苍茫
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadWesternGobiFlats extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '丝路·戈壁荒滩');
    this.set(
      'long',
      '脚下不再是黄沙，而是无穷无尽的碎石——大大小小的砾石铺满地面，' +
        '颜色从灰白到铁锈红不等，仿佛被某位巨人随手打碎后均匀撒开。' +
        '没有一棵树，没有一根草，连低矮的灌木都消失了，' +
        '天地之间只剩下灰褐色的石滩和头顶那片冷硬的蓝。' +
        '风掠过戈壁发出嗡嗡的低鸣，像是大地在闷声叹息。' +
        '偶有一两只灰隼在高空盘旋，看不出它们在猎什么——' +
        '这里连可供猎食的活物都极少。',
    );
    this.set('coordinates', { x: -1, y: 0, z: 0 });
    this.set('exits', {
      east: 'area/road-western/east-end',
      west: 'area/road-western/dusty-wasteland',
    });
  }
}
