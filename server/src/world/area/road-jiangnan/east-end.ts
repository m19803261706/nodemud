/**
 * 水路·烟雨镇外 — 水路·江南段
 * 坐标: (4,0,0)
 * 烟雨镇入口，码头与牌坊
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadJiangnanEastEnd extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '水路·烟雨镇外');
    this.set(
      'long',
      '已至烟雨镇外，码头沿岸停泊着几艘黑色乌篷船，船身低矮，' +
        '船夫将竹篙插在泥里，靠在船头抽着旱烟。' +
        '镇口立着一座青砖牌坊，横匾上用隶书刻着"烟雨"二字，' +
        '笔画圆润，据说是某位告老还乡的文官所题，已有百年历史。' +
        '牌坊两侧各有一株老柳，根已深入码头石缝，' +
        '枝条垂落及肩，过往行人须低头弯腰才能穿过。',
    );
    this.set('coordinates', { x: 4, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/road-jiangnan/lotus-lake',
      east: 'area/jiangnan/west-dock',
    });
  }
}
