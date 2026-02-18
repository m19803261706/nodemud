/**
 * 山间溪涧
 * 山道中段西侧，清溪流淌之处
 * 坐标: (-1, -2, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class SongyangMountainStream extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '山间溪涧');
    this.set(
      'long',
      '清溪从岩缝间淌出，汇成一潭浅水，水面映着头顶枝叶的碎影。溪畔生着几味野草药，叶片沾着水雾，散出淡淡苦香。石头上长满青苔，踩上去颇为湿滑。',
    );
    this.set('coordinates', { x: -1, y: -2, z: 0 });
    this.set('exits', {
      east: 'area/songyang/mountain-path-middle',
    });

    // 可采集资源（山溪野生草药，品种少但有稀有的）
    this.set('gatherables', [
      {
        id: 'herb-七星莲',
        name: '七星莲',
        messages: [
          '你在溪边的湿石缝中发现一株{name}，小心摘下。',
          '潭水旁长着几株{name}，叶片沾满水雾，你采下一株。',
        ],
      },
      {
        id: 'herb-断肠藤',
        name: '断肠藤',
        messages: [
          '崖壁上垂下几条{name}，你攀上去扯下一段。',
          '溪畔岩缝里蔓延着{name}，你小心地截取一截。',
        ],
      },
      {
        id: 'herb-金线草',
        name: '金线草',
        messages: ['你在溪流转弯处发现几株野生的{name}。', '青苔间夹杂着一株{name}，你弯腰采下。'],
      },
    ]);

    // 房间动态动作按钮
    this.set('roomActions', [
      { id: 'gather', label: '采集', command: 'gather' },
    ]);
  }
}
