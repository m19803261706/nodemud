/**
 * 雾岚寨·竹楼群 — 族人居住区
 * 坐标: (-1, 0, 0)
 * 吊脚竹楼错落排列，炊烟袅袅，日常生活气息
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class NanjiangSouthBambooHouses extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '雾岚寨·竹楼群');
    this.set(
      'long',
      '十几栋吊脚竹楼沿着山势错落而建，每一栋都用粗竹做柱、青瓦做顶，' +
        '底层悬空，用来养鸡鸭和存放杂物。楼上住人，窗户挂着蜡染的蓝布帘子，' +
        '风一吹就鼓起来，露出里面昏暗的光。' +
        '竹楼之间用木板桥相连，走在上面嘎吱作响。' +
        '空气中飘着酸汤鱼的香味，有妇人在楼前纺线，' +
        '几个孩子追着一只花毛鸡在竹楼间跑来跑去，笑声清脆。' +
        '一位老婆婆坐在门口编竹篮，嘴里哼着不成调的苗歌。',
    );
    this.set('coordinates', { x: -1, y: 0, z: 0 });
    this.set('exits', {
      east: 'area/nanjiang-south/zhai-gate',
      west: 'area/nanjiang-south/silversmith',
      south: 'area/nanjiang-south/council-hall',
    });
  }
}
