/**
 * 潮汐港·渔网作坊 — 编织渔网的手工作坊
 * 坐标: (2, 0, 0) — 调整为 (2, 0, 0)
 * 渔网与绳索的世界，手艺人的领地
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class EasternSeaNetWorkshop extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '潮汐港·渔网作坊');
    this.set(
      'long',
      '一间宽敞的棚屋里挂满了大大小小的渔网，' +
        '从天花板一直垂到地面，像一道道粗糙的帘幕。' +
        '几个老练的渔妇坐在矮凳上，手指翻飞地编织新网，' +
        '速度快得让人眼花，每一个结都系得紧实牢固。' +
        '地上散落着剪断的绳头和废弃的网片，' +
        '角落堆着成捆的麻绳和棕丝，是编网的原料。' +
        '作坊后面的架子上还挂着一些特殊的网——' +
        '网眼更密，绳索更粗，据说不是用来捕鱼的，' +
        '而是用来在海战中抛向敌船甲板。',
    );
    this.set('coordinates', { x: 2, y: 0, z: 0 });
    this.set('exits', {
      south: 'area/eastern-sea/fishing-dock',
      west: 'area/eastern-sea/shipyard',
    });
  }
}
