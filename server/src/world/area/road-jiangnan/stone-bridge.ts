/**
 * 水路·石板古桥 — 水路·江南段
 * 坐标: (5,0,0)
 * 一座古老的石板平桥，桥面布满岁月痕迹
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadJiangnanStoneBridge extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '水路·石板古桥');
    this.set(
      'long',
      '一座三孔石板桥横跨河面，桥身低矮，涨水时河水几乎能漫过桥面。' +
        '桥面由整块青石铺就，年深日久已被行人的脚步磨得光滑圆润，' +
        '雨天走上去须十分小心。' +
        '桥墩被河水冲刷出一道道沟痕，缝隙里长满了水草，' +
        '随水流方向一齐摇摆，像是绿色的长发。' +
        '桥头蹲着一只石狮子，已经风化得面目模糊，' +
        '但依稀能看出张口含珠的形态，据说是前朝遗物。',
    );
    this.set('coordinates', { x: 5, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/road-jiangnan/misty-bridge',
      east: 'area/road-jiangnan/lotus-lake',
    });
  }
}
