/**
 * 裂隙镇·书院讲堂
 * 坐标: (-2, 1, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RiftTownAcademy extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '裂隙镇·书院讲堂');
    this.set(
      'long',
      '讲堂窗明几净，木案排得整齐，墙上悬着“先立心，再立身”的字幅。几名少年正低声背诵经脉口诀，偶尔还能听见夫子用戒尺轻敲案面的声音。',
    );
    this.set('coordinates', { x: -2, y: 1, z: 0 });
    this.set('exits', {
      east: 'area/rift-town/notice-board',
      west: 'area/rift-town/academy-library',
    });
  }
}
