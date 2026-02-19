/**
 * 官道·冻原小径 — 官道北境段
 * 坐标: (0, -2, 0)
 * 霜冻覆盖的路段，野狼出没之地
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadNorthFrozenTrail extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '官道·冻原小径');
    this.set(
      'long',
      '路面被霜冻咬得硬邦邦的，踩上去发出沉闷的咔嚓声。' +
        '官道两侧的灌木早已枯死，黑色的枯枝如同骨骸横陈在白霜之上。' +
        '天色灰蒙蒙的，看不见太阳，只剩漫无边际的苍白与寂静。' +
        '雪地里能看见一串串爪印，足迹深而有力，是狼群巡游留下的痕迹。' +
        '偶尔远处会传来低沉的嗥叫，回荡在空旷的冻原上久久不散。' +
        '走这条路的商旅都会结伴而行，不敢单独落单。',
    );
    this.set('coordinates', { x: 0, y: -2, z: 0 });
    this.set('exits', {
      south: 'area/road-north/wind-pass',
      north: 'area/road-north/grassland',
    });
  }
}
