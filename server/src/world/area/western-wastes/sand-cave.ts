/**
 * 黄沙驿·沙窟 — 沙丘下的天然洞穴
 * 坐标: (-1, -3, 0)
 * 沙匪的藏身之处，危险但也可能藏有宝物
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class WesternWastesSandCave extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '黄沙驿·沙窟');
    this.set(
      'long',
      '沙丘底部有一个天然的洞口，被人为挖宽过，勉强能弯腰走进去。' +
        '洞内出奇地凉爽，与外面的灼热形成强烈反差。' +
        '洞壁是压实的沙层，偶尔有细沙簌簌落下，提醒人这里随时可能塌方。' +
        '地上有火堆的痕迹和吃剩的骨头，角落里堆着几只破旧的麻袋，' +
        '不知里面装着什么。' +
        '更深处有一条狭窄的通道，黑黢黢的看不到尽头，' +
        '从那里吹出来的风带着一股潮湿的土腥味，' +
        '说明地下某处可能连通着水脉。' +
        '这是沙匪藏身的好地方——隐蔽、凉爽、有多条逃路。',
    );
    this.set('coordinates', { x: -1, y: -3, z: 0 });
    this.set('exits', {
      east: 'area/western-wastes/abandoned-camp',
    });
  }
}
