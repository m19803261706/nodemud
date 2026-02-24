/**
 * 官道·废村 — 官道中原段
 * 坐标: (0, 4, 0)
 * 官道旁一座被遗弃的村庄，断壁残垣间杂草丛生
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadCentralRuinedVillage extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '官道·废村');
    this.set(
      'long',
      '官道从一片废墟旁经过，那是一座早已无人居住的村庄。' +
        '土墙只剩下齐腰高的残根，墙缝里长满了蒿草和牵牛花。' +
        '几根被烧焦的房梁歪倒在碎瓦堆中，隐约可以辨出几户人家的格局。' +
        '一口老井的石栏还立在村中央，井口被枯叶和泥土堵了大半。' +
        '据路过的行商说，这村子在十年前的兵祸中被焚毁，村民四散逃难，再没有人回来过。',
    );
    this.set('coordinates', { x: 0, y: 4, z: 0 });
    this.set('exits', {
      north: 'area/road-central/old-bridge',
      south: 'area/road-central/ancient-battlefield',
    });
  }
}
