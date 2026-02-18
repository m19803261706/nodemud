/**
 * 嵩阳宗·药圃
 * 弟子院以南，种植灵草药材之所
 * 坐标: (-1, -4, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class SongyangHerbGarden extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '嵩阳宗·药圃');
    this.set(
      'long',
      '几畦药田整齐排列，篱笆用竹枝编就。灵草在山风中轻摇，叶面沾着晨露，散发出清苦的草药气息。田间插着手写的药名竹牌，字迹稚拙，多是药童所书。',
    );
    this.set('coordinates', { x: -1, y: -4, z: 0 });
    this.set('exits', {
      north: 'area/songyang/disciples-yard',
    });
  }
}
