/**
 * 嵩阳山道·中段
 * 山道渐窄，两侧岔路通向不同去处
 * 坐标: (0, -2, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class SongyangMountainPathMiddle extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '嵩阳山道·中段');
    this.set(
      'long',
      '山道行至此处渐窄，两侧灌木丛生，脚下碎石松动。西面传来潺潺水声，东面则是一片乱石坡地。路旁有人用朱漆在石壁上写了"慎行"二字，漆色已褪得发白。',
    );
    this.set('coordinates', { x: 0, y: -2, z: 0 });
    this.set('exits', {
      north: 'area/songyang/pine-pavilion',
      south: 'area/songyang/mountain-path-lower',
      west: 'area/songyang/mountain-stream',
      east: 'area/songyang/rocky-slope',
    });
  }
}
