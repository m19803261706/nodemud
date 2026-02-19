/**
 * 山路·竹林小径 — 蛮疆山路第二段
 * 坐标: (0, 1, 0)
 * 密竹遮天，毒蛇出没
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadNanjiangBambooPath extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '山路·竹林小径');
    this.set(
      'long',
      '密密匝匝的翠竹从两侧夹道而生，竹梢在头顶交织成一顶绿色穹盖，' +
        '阳光只剩细碎的光斑洒在泥地上，光线昏暗，湿气浓重。' +
        '脚踩下去，地面软而粘，踩得竹叶沙沙响。' +
        '偶尔传来不知名的鸟叫，短促而尖锐，接着是一段沉默。' +
        '远处似乎有低沉的鼓声，断断续续，像是有人在林子深处击鼓，又像是幻觉。' +
        '草丛间偶有细小的动静，是某种东西在悄悄移动。',
    );
    this.set('coordinates', { x: 0, y: 1, z: 0 });
    this.set('exits', {
      north: 'area/road-nanjiang/north-end',
      south: 'area/road-nanjiang/vine-bridge',
    });
  }
}
