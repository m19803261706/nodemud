/**
 * 官道·猎人营地 — 官道北境段
 * 坐标: (0, -5, 0)
 * 北境猎户搭建的临时营地，篝火余温尚存
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadNorthHunterCamp extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '官道·猎人营地');
    this.set(
      'long',
      '路边一处避风的洼地里，几块石头围出一个简易火塘，' +
        '灰烬中还埋着没烧透的炭块，用脚一拨，尚有余温。' +
        '旁边搭着一个兽皮帐篷，用几根木杆支起，歪歪斜斜但很结实。' +
        '帐篷外挂着几张正在风干的狼皮，边上一个木架上晾着几条肉干。' +
        '地上散落着箭矢的碎屑和兽骨，是猎户修整装备和处理猎物的痕迹。' +
        '这里是北境猎户的临时落脚点，进出荒原时都会在此歇上一宿。',
    );
    this.set('coordinates', { x: 0, y: -5, z: 0 });
    this.set('exits', {
      south: 'area/road-north/stone-cairn',
      north: 'area/road-north/grassland',
    });
  }
}
