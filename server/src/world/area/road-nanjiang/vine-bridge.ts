/**
 * 山路·藤桥 — 蛮疆山路第三段
 * 坐标: (0, 2, 0)
 * 横跨深谷的藤蔓桥，谷底白雾弥漫
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadNanjiangVineBridge extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '山路·藤桥');
    this.set(
      'long',
      '小径在此中断，由一座藤蔓编成的吊桥衔接两侧山体。' +
        '桥面由横排木板铺成，木板之间留有缝隙，踩上去晃晃悠悠，吱嘎作响。' +
        '桥栏是两股粗藤，粗得像人的手腕，不知在这里挂了多少年，已经变得坚韧如铁。' +
        '俯身往下看——谷底什么也看不见，只有白茫茫的雾气，' +
        '偶尔有山风从谷底涌上来，带着湿冷的气息，吹得桥身微微摆动。' +
        '不知道谷有多深。',
    );
    this.set('coordinates', { x: 0, y: 2, z: 0 });
    this.set('exits', {
      north: 'area/road-nanjiang/bamboo-path',
      south: 'area/road-nanjiang/mist-valley',
    });
  }
}
