/**
 * 官道·裂谷口 — 官道中原段北端
 * 坐标: (0, 0, 0)
 * 衔接裂隙镇南门与官道黄土路
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadCentralNorthEnd extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '官道·裂谷口');
    this.set(
      'long',
      '刚出裂隙镇南门，黄土路宽阔平整，两侧裂崖渐渐收低，化作起伏的黄土坡地。' +
        '晨风带着干燥的泥土气息，路面上留有深浅不一的车辙印迹，来往商队走出了这条磨光的官道。' +
        '回头望去，裂隙镇的拱门还在视野中，门楣上的三个字迎风而立。',
    );
    this.set('coordinates', { x: 0, y: 0, z: 0 });
    this.set('exits', {
      north: 'area/rift-town/south-gate',
      south: 'area/road-central/dusty-road',
    });
  }
}
