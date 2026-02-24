/**
 * 雾岚寨·瞭望台 — 寨门上方高台
 * 坐标: (0, 0, 1)
 * 登高远望，俯瞰山下官道与云海
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class NanjiangSouthWatchtower extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '雾岚寨·瞭望台');
    this.set(
      'long',
      '几根粗木搭出一个高台，站在上面可以俯瞰寨门外蜿蜒的山路。' +
        '高处风大，衣袂猎猎作响，远处群山在云雾中若隐若现，像一幅没有画完的水墨。' +
        '台上立着一面牛皮大鼓，鼓面已经泛黄，鼓槌斜靠在一旁。' +
        '据说一旦有外敌来犯，鼓声可以传到五里之外。' +
        '几个苗族哨兵轮流在此值守，目光锐利地扫视着山下每一条小路。' +
        '台面上散落着几个竹筒，是哨兵们轮值时喝水用的。',
    );
    this.set('coordinates', { x: 0, y: 0, z: 1 });
    this.set('exits', {
      down: 'area/nanjiang-south/zhai-gate',
    });
  }
}
