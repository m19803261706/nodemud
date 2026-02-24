/**
 * 烟雨镇·万通当铺 — 明面当铺，暗通黑市
 * 坐标: (2, 3, 0)
 * 铁栅栏后的精明掌柜，不问来路只问价
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class JiangnanPawnShop extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '烟雨镇·万通当铺');
    this.set(
      'long',
      '当铺的门面不大，却修得格外结实，铁皮包着的木门足有三寸厚。' +
        '进门便是一道高高的柜台，柜台上横着一排铁栅栏，' +
        '当物的人需要把东西从栅栏下面的窄缝里递进去。' +
        '柜台后面的墙上挂满了各式各样的抵押品：玉佩、字画、兵器、首饰，' +
        '每一件都挂着写了日期和价格的纸签。' +
        '掌柜坐在柜台后面，手里永远拿着一把鎏金算盘，' +
        '目光从栅栏缝里打量着每一个进门的人，那眼神像是在估价。' +
        '店铺深处有一道暗门，门后是什么，外人无从得知。',
    );
    this.set('coordinates', { x: 2, y: 3, z: 0 });
    this.set('exits', {
      west: 'area/jiangnan/herb-shop',
    });
  }
}
