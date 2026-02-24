/**
 * 海路·三岔口 — 海路·东海段
 * 坐标: (5,0,0)
 * 海盗出没的岔路口，通往渔村和港口两个方向
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadEasternPirateFork extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '海路·三岔口');
    this.set(
      'long',
      '道路在这里分成了两条，一条沿着海岸继续向东，' +
        '另一条斜插进一片低矮的灌木丛中，不知通往何处。' +
        '岔路口竖着一根粗木桩，上面钉着一块歪歪斜斜的木牌，' +
        '字迹潦草地写着"此路不通"，但木牌下方的泥地上，' +
        '分明有许多杂乱的脚印，看起来倒像是很多人来来往往。' +
        '灌木丛深处隐约传来金属碰撞声，像是有人在搬运什么重物。',
    );
    this.set('coordinates', { x: 5, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/road-eastern/wind-cliff',
      east: 'area/road-eastern/fishing-village',
    });
  }
}
