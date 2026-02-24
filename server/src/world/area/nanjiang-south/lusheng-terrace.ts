/**
 * 雾岚寨·芦笙台 — 苗族歌舞场
 * 坐标: (-2, 2, 0)
 * 族人聚会跳舞、吹芦笙的圆形广场
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class NanjiangSouthLushengTerrace extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '雾岚寨·芦笙台');
    this.set(
      'long',
      '一片用石板铺成的圆形广场，石板被磨得光滑发亮，' +
        '那是无数双赤脚踩踏出来的光泽。广场中央竖着一根高高的铜鼓柱，' +
        '柱顶挂着一面青铜鼓，鼓面上铸着太阳纹和蛙纹，年代久远。' +
        '广场边缘摆着几排石凳，石凳上方搭着简单的竹棚遮阳。' +
        '一个年轻的苗族男子坐在角落里调试芦笙，' +
        '几根竹管长短不一，发出呜呜咽咽的试音，像是山风穿过竹林的声音。' +
        '据说每到月圆和丰收时节，全寨老小都会聚在这里，' +
        '点起篝火，吹芦笙、跳铜鼓舞，一跳就是一整夜。',
    );
    this.set('coordinates', { x: -2, y: 2, z: 0 });
    this.set('exits', {
      east: 'area/nanjiang-south/altar',
    });
  }
}
