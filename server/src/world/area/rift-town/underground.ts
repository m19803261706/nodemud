/**
 * 裂隙镇·地下暗道入口
 * 坐标: (0, 0, -1)
 * 彩蛋预埋：碎石堵路，后续版本开放通往中古纪遗迹副本
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RiftTownUnderground extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '裂隙镇·地下暗道入口');
    this.set(
      'long',
      '广场残碑下方有一个隐蔽的裂缝，勉强容一人侧身而入。裂缝内是一段向下的石阶，被水渍和青苔覆盖。阴冷的空气从深处涌上来，隐约带着一股古老而陌生的气息。石阶尽头被一堆碎石堵住，暂时无法通行。',
    );
    this.set('coordinates', { x: 0, y: 0, z: -1 });
    this.set('exits', {
      up: 'area/rift-town/square',
    });
  }
}
