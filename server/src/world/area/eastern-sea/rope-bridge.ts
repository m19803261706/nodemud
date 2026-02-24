/**
 * 潮汐港·绳桥栈道 — 悬崖边的危险通道
 * 坐标: (0, -1, 0)
 * 连接港口入口与北面悬崖的绳索栈道
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class EasternSeaRopeBridge extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '潮汐港·绳桥栈道');
    this.set(
      'long',
      '一条用粗麻绳和腐朽木板搭成的栈道沿着悬崖边缘延伸，' +
        '脚下就是十几丈高的礁石和翻涌的白浪。' +
        '栈道摇摇晃晃，每走一步，木板都发出令人心悸的吱嘎声。' +
        '绳索上结满了盐霜，摸上去粗糙得割手，' +
        '有几处已经磨得只剩几根丝，看着随时可能断裂。' +
        '崖壁上长满了耐盐的灌木和海草，' +
        '海风从下方呼啸而上，吹得人站立不稳。' +
        '栈道中段有一块稍大的平台，上面放着一盏油灯和一卷备用的绳索，' +
        '是夜间行走的紧急补给。' +
        '这条路虽然危险，却是从港口北上的唯一捷径。',
    );
    this.set('coordinates', { x: 0, y: -1, z: 0 });
    this.set('exits', {
      south: 'area/eastern-sea/harbor-gate',
    });
  }
}
