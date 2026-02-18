/**
 * 官道·嵩山段
 * 嵩山脚下的官道，连接山道与裂谷方向
 * 坐标: (0, 0, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class SongyangRoadSongshan extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '官道·嵩山段');
    this.set(
      'long',
      '宽阔的官道向南北延伸，路旁立着一块风化的石碑，上刻"嵩山"二字，笔画已被岁月磨去大半。道旁有车辙压出的深痕，偶有牛车缓缓驶过，车夫遥遥向你点了点头。',
    );
    this.set('coordinates', { x: 0, y: 0, z: 0 });
    this.set('exits', {
      north: 'area/songyang/mountain-path-lower',
      south: 'area/songyang/road-rift',
    });
  }
}
