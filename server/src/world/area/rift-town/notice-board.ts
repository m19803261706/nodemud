/**
 * 裂隙镇·告示牌旁
 * 坐标: (-1, 1, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RiftTownNoticeBoard extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '裂隙镇·告示牌旁');
    this.set(
      'long',
      '路边竖着一块被风吹日晒得斑驳的告示牌，上面贴满了各种告示：承天朝的征兵令、悬赏逃犯的画像、寻人启事、商队招护卫……有些告示已经泛黄卷边，有些墨迹未干。',
    );
    this.set('coordinates', { x: -1, y: 1, z: 0 });
    this.set('exits', {
      east: 'area/rift-town/south-street',
    });
  }
}
