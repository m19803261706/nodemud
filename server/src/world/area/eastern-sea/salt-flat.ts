/**
 * 潮汐港·晒盐场 — 盐渍遍地的空旷场地
 * 坐标: (2, 2, 0)
 * 阳光暴晒，白花花的盐结晶铺满地面
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class EasternSeaSaltFlat extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '潮汐港·晒盐场');
    this.set(
      'long',
      '一片开阔的石滩被分割成大大小小的方格，每一格里都蓄着浅浅的海水。' +
        '烈日之下，水面蒸腾着热气，白花花的盐结晶沿着格子边缘层层堆积。' +
        '几个赤脚的盐工弯腰在格子间穿行，用木耙把结好的粗盐拢成小堆。' +
        '他们的皮肤被日头晒得发黑，手脚上全是被盐粒磨出的细小伤口。' +
        '盐场边上堆着成排的麻袋，装好的盐就从这里被运往黑市，' +
        '私盐在朝廷眼里是重罪，但在潮汐港，' +
        '这不过是最普通的一桩买卖。',
    );
    this.set('coordinates', { x: 2, y: 2, z: 0 });
    this.set('exits', {
      north: 'area/eastern-sea/fishing-dock',
      west: 'area/eastern-sea/blade-street',
    });
  }
}
