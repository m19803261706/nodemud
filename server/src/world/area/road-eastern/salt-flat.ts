/**
 * 海路·晒盐坊 — 海路·东海段
 * 坐标: (2,0,0)
 * 海边盐场，沿海居民赖以为生的晒盐地
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadEasternSaltFlat extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '海路·晒盐坊');
    this.set(
      'long',
      '一片平坦的盐田铺展在海岸边，用青石垒成的浅池一格一格排列整齐，' +
        '池底铺着灰白色的结晶盐，在日头下泛出刺目的光。' +
        '几个盐工弯腰劳作，用木耙将粗盐归拢成堆，汗水顺着黝黑的脊背往下淌。' +
        '空气中弥漫着浓重的咸味，呛得人直想打喷嚏。' +
        '盐田尽头搭着一间草棚，里面堆满了麻袋装好的粗盐，' +
        '等着商队来收，运往内陆各地。',
    );
    this.set('coordinates', { x: 2, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/road-eastern/coastal-road',
      east: 'area/road-eastern/sea-cliff',
    });
  }
}
