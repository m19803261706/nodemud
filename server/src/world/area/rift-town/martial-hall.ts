/**
 * 裂隙镇·武馆前堂
 * 坐标: (2, -1, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RiftTownMartialHall extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '裂隙镇·武馆前堂');
    this.set(
      'long',
      '木梁高挑的前堂里挂着旧兵器和沙袋，地面被反复踩得发亮。墙边立着几块写满步法口诀的木牌，偶有新手在此扎马抬臂，呼吸声此起彼伏。',
    );
    this.set('coordinates', { x: 2, y: -1, z: 0 });
    this.set('exits', {
      west: 'area/rift-town/smithy',
      east: 'area/rift-town/training-yard',
    });
  }
}
