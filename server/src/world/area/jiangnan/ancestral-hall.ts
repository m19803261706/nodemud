/**
 * 烟雨镇·沈氏祠堂 — 镇上大族的祠堂
 * 坐标: (0, 2, 0)
 * 古老家族的根基，香火缭绕
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class JiangnanAncestralHall extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '烟雨镇·沈氏祠堂');
    this.set(
      'long',
      '祠堂坐北朝南，门楼上挂着"沈氏宗祠"的石刻匾额，字迹斑驳却不失庄重。' +
        '大门两侧的石鼓已被风化得棱角模糊，门槛高得需要抬腿跨过。' +
        '堂内正中供着沈氏列祖列宗的牌位，层层叠叠排了七八排，' +
        '最上面那几块已经看不清字迹。' +
        '香炉里插满了线香，烟雾缭绕升起又被穿堂风吹散。' +
        '两侧墙上挂着几幅泛黄的画像和一把生锈的古剑，' +
        '据说沈家祖上也曾是行走江湖的人物。',
    );
    this.set('coordinates', { x: 0, y: 2, z: 0 });
    this.set('exits', {
      north: 'area/jiangnan/fishing-village',
      east: 'area/jiangnan/south-street',
      south: 'area/jiangnan/escort-office',
    });
  }
}
