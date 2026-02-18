/**
 * 乱石坡
 * 山道中段东侧，碎石遍地的坡地（野怪出没区）
 * 坐标: (1, -2, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class SongyangRockySlope extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '乱石坡');
    this.set(
      'long',
      '碎石遍地，灌木丛中不时传来窸窣声响。几块巨石歪斜堆叠，留出不少可供藏身的缝隙。地上散落着啃过的骨头和破烂布片，显然有什么东西盘踞于此。远处山道上偶尔传来行人的脚步声，却无人愿意在此久留。',
    );
    this.set('coordinates', { x: 1, y: -2, z: 0 });
    this.set('exits', {
      west: 'area/songyang/mountain-path-middle',
    });
  }
}
