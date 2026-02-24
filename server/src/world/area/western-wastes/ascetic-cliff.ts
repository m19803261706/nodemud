/**
 * 黄沙驿·苦行者崖 — 密宗苦行修炼之地
 * 坐标: (-1, 3, 0)
 * 星轨殿遗址南端的石崖，苦行者在此面壁修行
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class WesternWastesAsceticCliff extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '黄沙驿·苦行者崖');
    this.set(
      'long',
      '一面赭红色的石崖从沙地中拔起，高约三丈，崖壁上风蚀出大大小小的凹洞。' +
        '几个最大的凹洞里有人居住的痕迹：铺着草席，放着水碗，' +
        '墙壁上用石子刻着密宗的经文和法印。' +
        '这是苦行者的修行之所，他们在此面壁数月甚至数年，' +
        '以极端的方式锤炼心志，据说有人在此悟道，也有人在此发疯。' +
        '崖下散落着碎石，偶尔有蜥蜴从石缝中探出头来，' +
        '在灼热的石面上快速爬过，消失在另一条裂缝里。' +
        '风从崖顶吹过时发出呜呜的声音，像是石头在低声叹息。',
    );
    this.set('coordinates', { x: -1, y: 3, z: 0 });
    this.set('exits', {
      north: 'area/western-wastes/star-ruins',
      east: 'area/western-wastes/oasis-lake',
    });
  }
}
