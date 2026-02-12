/**
 * 裂隙镇·安歇客栈
 * 坐标: (1, 0, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';
import { PlayerBase } from '../../../engine/game-objects/player-base';
import {
  GameEvents,
  type CancellableEvent,
  type MoveEventData,
} from '../../../engine/types/events';

const INN_UPSTAIRS_ROOM_ID = 'area/rift-town/inn-upstairs';
const INN_RENT_PASS_TEMP_KEY = 'inn/rift_town_rent_pass_until';

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
      up: INN_UPSTAIRS_ROOM_ID,
    });

    // 上楼门禁：需先向店小二付房钱，拿到短时通行凭证。
    this.on(GameEvents.PRE_LEAVE, (event: CancellableEvent & MoveEventData) => {
      this.checkInnUpstairsAccess(event);
    });
  }

  private checkInnUpstairsAccess(event: CancellableEvent & MoveEventData): void {
    const mover = event.who;
    const dest = event.dest;
    if (!(mover instanceof PlayerBase)) return;
    if (!(dest instanceof RoomBase) || dest.id !== INN_UPSTAIRS_ROOM_ID) return;

    const passUntil = mover.getTemp<number>(INN_RENT_PASS_TEMP_KEY) ?? 0;
    if (passUntil > Date.now()) {
      // 一次性凭证：放行时立即消耗。
      mover.setTemp(INN_RENT_PASS_TEMP_KEY, 0);
      return;
    }

    mover.receiveMessage('楼梯口被店小二伸手拦住：「客官，先付房钱再上楼歇息。」');
    event.cancel();
  }
}
