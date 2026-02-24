/**
 * 黄沙驿·经堂 — 密宗经文抄写与诵经之所
 * 坐标: (0, 1, 0)
 * 安静的宗教场所，墙上绘满了壁画
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class WesternWastesSutraHall extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '黄沙驿·经堂');
    this.set(
      'long',
      '用泥砖垒成的矮房，门框上挂着褪色的经幡，风一吹，发出细细的声响。' +
        '屋内三面墙上画满了壁画，颜色大多已经暗淡，' +
        '但依稀能辨出佛陀的手印、密宗的法轮和一些象征吉祥的纹饰。' +
        '地上摆着几只蒲团，蒲团前面是一张矮桌，上面放着纸笔和半卷抄写到一半的经文。' +
        '角落里有一盏酥油灯，灯火微弱，在没有风的时候几乎不动，' +
        '在有风的时候拼命晃，好像随时会灭，但一直没灭。' +
        '偶尔有旅人走进来，不为诵经，只为歇脚——这里比外面凉快一些。',
    );
    this.set('coordinates', { x: 0, y: 1, z: 0 });
    this.set('exits', {
      west: 'area/western-wastes/meditation-tent',
      south: 'area/western-wastes/palm-grove',
    });
  }
}
