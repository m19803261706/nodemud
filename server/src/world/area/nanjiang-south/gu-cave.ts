/**
 * 雾岚寨·蛊洞 — 天然溶洞，蛊虫培养之地
 * 坐标: (2, 2, 0)
 * 阴暗潮湿的山洞，蛊虫的温床
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class NanjiangSouthGuCave extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '雾岚寨·蛊洞');
    this.set(
      'long',
      '石阶尽头是一个天然形成的溶洞，洞口不大，需要弯腰才能进入。' +
        '洞内出奇地温暖潮湿，石壁上渗着水珠，' +
        '借着从洞口透进来的微光，可以看到壁上生长着一层荧绿色的苔藓，' +
        '散发着幽幽的冷光。' +
        '地上摆着几十个大大小小的陶缸，缸中盛着腐土和草叶，' +
        '是培养蛊虫的温床。有些缸里传来窸窸窣窣的声响，' +
        '让人不由自主地想要离远一些。' +
        '洞壁上刻着一些古老的苗文，字迹被水渍侵蚀得模糊不清，' +
        '只隐约能辨出几个类似蛇和虫的图形。洞深处一片漆黑，不知通向哪里。',
    );
    this.set('coordinates', { x: 2, y: 2, z: 0 });
    this.set('exits', {
      north: 'area/nanjiang-south/drying-yard',
    });
  }
}
