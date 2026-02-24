/**
 * 洛阳废都·破败寺院 — 佛道共处的废弃殿堂
 * 坐标: (1, 2, 0)
 * 枯禅法师盘坐其中，经卷碎片散落一地
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class CentralPlainTempleRuins extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '洛阳废都·破败寺院');
    this.set(
      'long',
      '不知是佛寺还是道观——屋顶坍塌后露出的彩绘横梁上，' +
        '佛像与道符交替出现，想来曾经两家共处一檐，如今一同败落。' +
        '殿中仅有一角保存尚好，枯禅法师便盘坐于此，' +
        '面前一盏油灯，火苗细如游丝，身后是半截残佛，佛面已残缺不全。' +
        '殿中散落着断裂的木鱼和被踩碎的经卷，踩上去「沙沙」作响，' +
        '如同某种无人应答的钟鼓。' +
        '光线从屋顶破洞斜射而下，照亮了漂浮的灰尘，' +
        '令这里显出一种残破而奇异的庄严。',
    );
    this.set('coordinates', { x: 1, y: 2, z: 0 });
    this.set('exits', {
      north: 'area/central-plain/broken-hall',
      west: 'area/central-plain/south-avenue',
      south: 'area/central-plain/meditation-garden',
      east: 'area/central-plain/old-library',
    });
  }
}
