/**
 * 裂隙镇·镇中广场 — 出生点核心
 * 坐标: (0, 0, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RiftTownSquare extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '裂隙镇·镇中广场');
    this.set(
      'long',
      '裂隙镇的中心是一片不大的青石广场。四周断崖高耸，只在头顶留出一线天光。广场中央立着一块残碑，上面的字迹已被风雨侵蚀得模糊不清，只依稀可辨"天衍"二字。南来北往的行人在此交汇，空气中混杂着药草的苦涩和铁匠铺的炭火味。',
    );
    this.set('coordinates', { x: 0, y: 0, z: 0 });
    this.set('exits', {
      north: 'area/rift-town/north-street',
      south: 'area/rift-town/south-street',
      east: 'area/rift-town/inn',
      west: 'area/rift-town/tavern',
      down: 'area/rift-town/underground',
    });
  }
}
