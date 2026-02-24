/**
 * 雾岚寨·悬崖栈道 — 险峻的山壁通道
 * 坐标: (0, 4, 0)
 * 沿悬崖凿出的栈道，通往毒雾谷
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class NanjiangSouthCliffPath extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '雾岚寨·悬崖栈道');
    this.set(
      'long',
      '栈道沿着峭壁开凿而成，宽不过三尺，一侧是粗糙的岩壁，' +
        '另一侧便是深不见底的山谷。木板铺在石壁凿出的槽里，' +
        '有些已经朽烂，踩上去咯吱作响，让人心惊胆战。' +
        '铁链充当护栏，锈迹斑斑，牵一下便簌簌掉锈。' +
        '山风从谷底涌上来，带着潮湿的水汽，吹得人站不稳脚跟。' +
        '往下望去，云雾翻涌如海，偶尔雾气散开，' +
        '可以瞥见谷底隐约的绿色，那是终年不见阳光的密林。' +
        '栈道尽头的岩壁上有人用红泥画了一个骷髅头——那是苗人的警示，' +
        '意思是前方有凶险。',
    );
    this.set('coordinates', { x: 0, y: 4, z: 0 });
    this.set('exits', {
      east: 'area/nanjiang-south/deep-forest',
      south: 'area/nanjiang-south/poison-valley',
    });
  }
}
