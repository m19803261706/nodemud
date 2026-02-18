/**
 * 古松亭
 * 嵩阳山道上段与中段之间，供行人歇脚的石亭
 * 坐标: (0, -3, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class SongyangPinePavilion extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '古松亭');
    this.set(
      'long',
      '数株百年古松遮天蔽日，树下一座六角石亭，亭柱上刻着前人题诗，墨迹已被风雨洗得浅淡。石凳上落着松针，偶有山鸟在枝头啁啾。此处可望见上方山门与下方山道，是登山途中歇脚之处。',
    );
    this.set('coordinates', { x: 0, y: -3, z: 0 });
    this.set('exits', {
      north: 'area/songyang/mountain-path',
      south: 'area/songyang/mountain-path-middle',
    });
  }
}
