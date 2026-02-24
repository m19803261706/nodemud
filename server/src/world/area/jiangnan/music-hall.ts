/**
 * 烟雨镇·清音琴馆 — 隐士抚琴之所
 * 坐标: (2, -2, 0)
 * 琴声悠扬，偶有高人在此论道
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class JiangnanMusicHall extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '烟雨镇·清音琴馆');
    this.set(
      'long',
      '琴馆藏在一片竹林深处，若非循着隐约的琴声，极难寻到入口。' +
        '推开竹编的矮门，迎面是一方小院，地上铺着细白砂石，' +
        '几块青石随意摆放，颇有枯山水的意趣。' +
        '正堂内挂着数张古琴，最中央的一张漆面已褪色泛白，' +
        '琴身上隐约可见"秋水"二字的篆刻。' +
        '墙上挂着一幅残缺的琴谱，据说是某位大家遗落的手稿，' +
        '馆主视若珍宝，从不轻易示人。',
    );
    this.set('coordinates', { x: 2, y: -2, z: 0 });
    this.set('exits', {
      west: 'area/jiangnan/academy',
      south: 'area/jiangnan/silk-shop',
    });
  }
}
