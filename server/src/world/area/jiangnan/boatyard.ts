/**
 * 烟雨镇·船坞 — 造船修船之所
 * 坐标: (2, 1, 0)
 * 木屑飞扬，桐油味浓，匠人手艺
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class JiangnanBoatyard extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '烟雨镇·船坞');
    this.set(
      'long',
      '船坞搭在东码头南侧的一片空地上，几艘半成品的木船架在支撑木上，' +
        '露着尚未合拢的肋骨般的龙骨。木屑铺了一地，踩上去沙沙作响。' +
        '空气中弥漫着桐油和新锯木头的混合气味，呛鼻却让人觉得踏实。' +
        '老船匠蹲在一艘船底下刷防水漆，手法娴熟得像在画画。' +
        '角落里堆着成捆的麻绳、铁钉和厚重的帆布，' +
        '墙上挂着各式造船工具，有些已锈迹斑斑，却仍被小心保存着。',
    );
    this.set('coordinates', { x: 2, y: 1, z: 0 });
    this.set('exits', {
      north: 'area/jiangnan/east-dock',
      west: 'area/jiangnan/stone-bridge',
      south: 'area/jiangnan/warehouse',
    });
  }
}
