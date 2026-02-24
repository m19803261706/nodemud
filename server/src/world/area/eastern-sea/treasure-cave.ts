/**
 * 潮汐港·藏宝洞 — 海盗埋藏宝物的洞窟
 * 坐标: (1, 4, -1)
 * 暗流涌动的地下洞窟，据说藏着初代港主的遗产
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class EasternSeaTreasureCave extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '潮汐港·藏宝洞');
    this.set(
      'long',
      '密道尽头豁然开朗，一个天然形成的岩洞出现在眼前。' +
        '洞顶倒挂着密密麻麻的钟乳石，水滴沿着石尖落下，' +
        '在地面的浅水中激起圈圈涟漪，声响在洞壁间来回反射。' +
        '洞中央有一块突起的平台，上面散落着几口朽烂的木箱，' +
        '箱盖已经塌陷，里面空空如也——要么早被人搬走了，' +
        '要么从一开始就是个幌子。' +
        '洞壁上有人用匕首刻了几行字，大多被水渍模糊了，' +
        '只有最后一行还依稀可辨："信者死，疑者活。"' +
        '洞穴深处传来海浪拍击岩壁的闷响，似乎连通着外面的大海。',
    );
    this.set('coordinates', { x: 1, y: 4, z: -1 });
    this.set('exits', {
      west: 'area/eastern-sea/smuggler-tunnel',
    });
  }
}
