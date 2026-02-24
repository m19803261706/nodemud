/**
 * 烟雨镇·桥畔亭 — 画桥上方的观景凉亭
 * 坐标: (1, 1, 1)
 * 登高望远，可观运河全景
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class JiangnanBridgePavilion extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '烟雨镇·桥畔亭');
    this.set(
      'long',
      '凉亭建在画桥东头的高台之上，六角飞檐，顶铺青瓦，' +
        '四面无墙，只有几根红漆木柱撑着。站在亭中居高临下，' +
        '运河南北两岸的景致尽收眼底：北岸是茶楼书院的雅致，' +
        '南岸是酒楼商铺的热闹，中间一弯碧水穿镇而过。' +
        '亭中石桌上刻着棋盘，棋子已不知去向，' +
        '只留下黑白相间的落子痕迹。' +
        '栏杆上系着不少红布条，是镇上人祈福的风俗，' +
        '风一吹便翻飞如蝶，平添几分热闹的颜色。',
    );
    this.set('coordinates', { x: 1, y: 1, z: 1 });
    this.set('exits', {
      down: 'area/jiangnan/stone-bridge',
    });
  }
}
