/**
 * 雾岚寨·银匠铺 — 苗族银饰锻造
 * 坐标: (-2, 0, 0)
 * 打造苗族银饰的作坊，银光闪闪
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class NanjiangSouthSilversmith extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '雾岚寨·银匠铺');
    this.set(
      'long',
      '叮叮当当的敲击声从这间矮小的石屋里传出来，' +
        '屋内光线昏暗，唯一的亮光来自炉膛里跳动的火焰。' +
        '一个精壮的苗族汉子坐在矮凳上，手持小锤，' +
        '正一下一下地敲打着银片，每一锤都精准而有分寸。' +
        '工作台上散落着各种半成品——银镯、银项圈、银牛角帽，' +
        '还有一些叫不出名字的精巧饰件，每一件都纹路繁复。' +
        '墙上挂着几件已经完工的银饰，火光一映，银光流转，耀人眼目。' +
        '据说苗族女子出嫁时身上的银饰重达十几斤，' +
        '每一件都由银匠一锤一锤敲出来，从定亲那天就开始打造。',
    );
    this.set('coordinates', { x: -2, y: 0, z: 0 });
    this.set('exits', {
      east: 'area/nanjiang-south/bamboo-houses',
    });
  }
}
