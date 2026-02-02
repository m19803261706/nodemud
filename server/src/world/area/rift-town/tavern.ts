/**
 * 裂隙镇·断崖酒馆
 * 坐标: (-1, 0, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RiftTownTavern extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '裂隙镇·断崖酒馆');
    this.set(
      'long',
      '酒馆依着西侧断崖而建，半截嵌入岩壁之中，终年阴凉。柜台后的酒保擦着杯子，不动声色地打量每一个进门的人。角落里坐着几个形迹可疑的客人，低声交谈着什么。墙上挂着一张褪色的天衍大陆舆图。',
    );
    this.set('coordinates', { x: -1, y: 0, z: 0 });
    this.set('exits', {
      east: 'area/rift-town/square',
    });
  }
}
