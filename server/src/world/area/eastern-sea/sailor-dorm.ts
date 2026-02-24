/**
 * 潮汐港·水手宿舍 — 临时住所
 * 坐标: (-1, 2, 0)
 * 简陋的集体宿舍，空气里全是汗味和咸味
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class EasternSeaSailorDorm extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '潮汐港·水手宿舍');
    this.set(
      'long',
      '一排低矮的木板房沿着港湾的石岸搭建，门板歪斜，窗户用草帘遮挡。' +
        '里面是上下两层的木板铺，每个铺位窄得翻身都困难，' +
        '枕头是卷起来的旧衣服，被子是撒了盐防虫的粗布。' +
        '空气中弥漫着汗味、脚臭和海盐的混合气息，' +
        '墙角挂着几件晾不干的衣服，在潮湿的空气中散发着霉味。' +
        '宿舍门口的柱子上钉满了招工告示，' +
        '大多是各条船招水手的——' +
        '有些写着"不问来历"，有些写着"能打者优先"，' +
        '看一眼就知道是什么性质的船。',
    );
    this.set('coordinates', { x: -1, y: 2, z: 0 });
    this.set('exits', {
      north: 'area/eastern-sea/harbor-inn',
      west: 'area/eastern-sea/watchtower',
      south: 'area/eastern-sea/freshwater-well',
    });
  }
}
