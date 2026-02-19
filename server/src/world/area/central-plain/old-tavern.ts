/**
 * 洛阳废都·残灯酒肆 — 废都酒楼
 * 坐标: (-1, 1, 0)
 * 信息交流中心，商行柳玉珠驻地
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class CentralPlainOldTavern extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '洛阳废都·残灯酒肆');
    this.set(
      'long',
      '半塌的酒楼门面勉强撑着，招牌早已不见，只剩悬挂招牌的铁钩锈迹斑斑地挂在门框上。' +
        '走进去，里面倒比外表热闹，三五桌客人低声交谈，形形色色——有风尘仆仆的旅人，' +
        '有眼神游走的探子，也有几个看不出来路的武人。' +
        '柜台后的掌柜一边擦着杯子，一边不动声色地打量每一个来客，' +
        '嘴角挂着职业性的微笑，什么都看进去了，什么都不说出来。' +
        '墙角挂着一盏残破的灯笼，灯芯将尽，光线昏黄摇曳。',
    );
    this.set('coordinates', { x: -1, y: 1, z: 0 });
    this.set('exits', {
      east: 'area/central-plain/ruins-square',
      west: 'area/road-western/east-end',
    });
  }
}
