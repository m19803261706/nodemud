/**
 * 裂隙镇·安歇客栈二楼包间
 * 坐标: (1, 0, 1)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';
import { PlayerBase } from '../../../engine/game-objects/player-base';
import { GameEvents, type MoveEventData } from '../../../engine/types/events';

export default class RiftTownInnUpstairs extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '裂隙镇·安歇客栈二楼');
    this.set(
      'long',
      '木阶尽头是一排隔开的包间，窗纸半透，烛影摇晃。被褥虽旧，却洗得干净，炉上温着一壶姜茶。你靠在窗边，能听见楼下人声渐远，只剩风过檐角。',
    );
    this.set('coordinates', { x: 1, y: 0, z: 1 });
    this.set('sleep_room', true);
    this.set('hotel', true);
    this.set('exits', {
      down: 'area/rift-town/inn',
    });

    // 入住后即时恢复精力。
    this.on(GameEvents.POST_RECEIVE, (event: MoveEventData) => {
      this.tryRecoverEnergy(event);
    });
  }

  private tryRecoverEnergy(event: MoveEventData): void {
    const who = event.who;
    if (!(who instanceof PlayerBase)) return;

    const maxEnergy = who.getMaxEnergy();
    if (typeof maxEnergy !== 'number' || maxEnergy <= 0) return;

    const current = who.get<number>('energy') ?? 0;
    const recovered = who.recoverEnergy(Math.max(0, maxEnergy - current));
    if (recovered <= 0) {
      who.receiveMessage('你在包间里盘膝调息片刻，气息平稳如初。');
      return;
    }

    who.receiveMessage(`你在包间里闭目调息，旅途倦意散去，精力恢复 ${recovered} 点。`);
  }
}
