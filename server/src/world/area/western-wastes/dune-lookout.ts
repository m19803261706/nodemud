/**
 * 黄沙驿·沙丘瞭望 — 驿站北端的观察点
 * 坐标: (0, -2, 0)
 * 登高远望，可见远方的沙海与偶尔经过的驼队
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class WesternWastesDuneLookout extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '黄沙驿·沙丘瞭望');
    this.set(
      'long',
      '绿洲北缘的一座沙丘，比周围高出几丈，是天然的瞭望台。' +
        '沙丘顶上用石头垒了一个简易的观察哨，旁边插着一面旗子，' +
        '用来向远处的驼队指示方向。' +
        '站在这里往北看，是一望无际的沙海，沙丘连绵起伏，' +
        '像是凝固的波浪，在阳光下泛着金色的光。' +
        '偶尔能看到一支驼队的黑影在天际线上缓缓移动，' +
        '驼铃声从很远的地方传来，被风吹得断断续续。' +
        '往南看则是驿站的全貌：帐篷、绿洲、袅袅炊烟，在沙漠中构成一幅小小的画。',
    );
    this.set('coordinates', { x: 0, y: -2, z: 0 });
    this.set('exits', {
      south: 'area/western-wastes/stable',
      west: 'area/western-wastes/well',
      north: 'area/western-wastes/abandoned-camp',
    });
  }
}
