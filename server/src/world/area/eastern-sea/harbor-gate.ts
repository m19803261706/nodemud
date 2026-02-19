/**
 * 潮汐港·港口 — 潮汐港
 * 坐标: (0,0,0)
 * 港口入口，破旧牌坊，各色旗帜
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class EasternSeaHarborGate extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '潮汐港·港口');
    this.set(
      'long',
      '一座破旧的港口牌坊斜立在海边，木料已经腐烂了三分之一，' +
        '只靠两根铁箍勉强撑着，上面的字迹早已模糊不可辨认。' +
        '牌坊两侧的绳索上挂满了各色旗帜，红的、黑的、花纹各异，' +
        '没有一面是官方认可的，却各有各的来历与意味。' +
        '进港的规矩写在一块熏黑的木板上：「不问来历，不问去向，钱够就行。」' +
        '港口边站着几个彪形大汉，眼神冷漠地打量每一个进来的人。',
    );
    this.set('coordinates', { x: 0, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/road-eastern/reef-path',
      south: 'area/eastern-sea/harbor-square',
    });
  }
}
