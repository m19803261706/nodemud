/**
 * 雾岚寨·密林猎场 — 部落狩猎区域
 * 坐标: (1, 4, 0)
 * 猎人们常来的狩猎场，野兽出没
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class NanjiangSouthDeepForest extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '雾岚寨·密林猎场');
    this.set(
      'long',
      '密林在此豁然开朗了一些，几棵大树之间形成一片相对空旷的林地。' +
        '地上有清晰的兽蹄印，大小不一，交错纵横，' +
        '说明这片林子里的动物不少。几棵树干上有爪痕，' +
        '有的浅如猫抓，有的深可入木，不知是什么猛兽留下的。' +
        '灌木丛中藏着几个竹制陷阱，做工精巧，用枯叶覆盖着，' +
        '不仔细看根本发现不了。' +
        '远处传来低沉的咆哮，在林间回荡，听不出距离远近。' +
        '树冠间偶尔有大鸟振翅飞过，带落一片枝叶。',
    );
    this.set('coordinates', { x: 1, y: 4, z: 0 });
    this.set('exits', {
      north: 'area/nanjiang-south/forest-path',
      west: 'area/nanjiang-south/cliff-path',
      east: 'area/nanjiang-south/waterfall-pool',
    });
  }
}
