/**
 * 烟雨镇·东码头 — 烟雨镇
 * 坐标: (2,0,0)
 * 出海方向码头，NPC 渡船老七在此
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class JiangnanEastDock extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '烟雨镇·东码头');
    this.set(
      'long',
      '东码头比西码头宽阔许多，停靠的船只也更大，有的桅杆高过了屋檐。' +
        '这里是去往东海方向的必经之所，船夫们皮肤黝黑，手掌粗糙，' +
        '眼神中带着长年跑海路的那种沉稳与警觉。' +
        '码头边挂着几盏防风灯，夜里不论风多大都不会熄灭，' +
        '是出海人的习俗，也是守望的信号。' +
        '渡船老七的乌篷船停在最靠近出口的位置，' +
        '船头挂着一块手写的木牌：「出海问老七，老七带你走。」',
    );
    this.set('coordinates', { x: 2, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/jiangnan/main-canal',
      east: 'area/road-eastern/west-end',
    });
  }
}
