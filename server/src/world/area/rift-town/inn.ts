/**
 * 裂隙镇·安歇客栈
 * 坐标: (1, 0, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RiftTownInn extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '裂隙镇·安歇客栈');
    this.set(
      'long',
      '客栈是裂隙镇为数不多的两层建筑，用裂谷中的灰白岩石砌成。一楼大堂摆着几张桌椅，二楼是客房。老板娘是个爽利的中年妇人，据说她丈夫是天裂中失踪的某个宗门弟子。',
    );
    this.set('coordinates', { x: 1, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/rift-town/square',
    });
  }
}
