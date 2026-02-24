/**
 * 烟雨镇·锦绣绸缎庄 — 江南丝绸名店
 * 坐标: (2, -1, 0)
 * 绫罗绸缎，富商云集
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class JiangnanSilkShop extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '烟雨镇·锦绣绸缎庄');
    this.set(
      'long',
      '绸缎庄的门面极阔，朱漆大门两侧各挂一匹五彩织锦作为招牌，' +
        '在日光下流转着绮丽的光泽。店内一排排木架上陈列着各色布料，' +
        '苏绣、蜀锦、云锦、湖绸，琳琅满目。' +
        '掌柜盛三娘站在柜台后拨着算盘，每一颗珠子落下都精准无比。' +
        '空气中弥漫着一股淡淡的染料香气，混着檀木衣柜的沉香。' +
        '店铺深处有一间密室，据说是接待贵客的雅间，非大主顾不可入内。',
    );
    this.set('coordinates', { x: 2, y: -1, z: 0 });
    this.set('exits', {
      north: 'area/jiangnan/music-hall',
      west: 'area/jiangnan/teahouse',
      south: 'area/jiangnan/east-dock',
    });
  }
}
