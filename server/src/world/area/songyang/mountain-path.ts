/**
 * 嵩阳山道
 * 坐标: (0, -4, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';
import { PlayerBase } from '../../../engine/game-objects/player-base';
import { NpcBase } from '../../../engine/game-objects/npc-base';
import {
  GameEvents,
  type CancellableEvent,
  type MoveEventData,
} from '../../../engine/types/events';

const SONGYANG_GATE_ROOM_ID = 'area/songyang/gate';
const GATE_GUARD_ID_PREFIX = 'npc/songyang/gate-disciple';
const GATE_PASS_TEMP_KEY = 'sect/songyang_gate_pass_until';

export default class SongyangMountainPath extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '嵩阳山道·上段');
    this.set(
      'long',
      '石阶沿山脊盘旋而上，松风穿林，钟声隐隐。两侧古木参天，枝叶间漏下斑驳日光，山门的轮廓已在目力之内。',
    );
    this.set('coordinates', { x: 0, y: -4, z: 0 });
    this.set('exits', {
      south: 'area/songyang/pine-pavilion',
      north: 'area/songyang/gate',
    });

    this.on(GameEvents.PRE_LEAVE, (event: CancellableEvent & MoveEventData) => {
      this.checkSongyangGateCheckpoint(event);
    });
  }

  /**
   * 山门拦路规则（事件驱动）：
   * - 仅在“嵩阳山道 -> 山门”时触发
   * - 守山弟子在场才会拦路；被击杀/离场则不触发
   * - 守山弟子若正被缠斗（fighting），可被趁隙通过
   * - 同门放行，外来者需一次性通行许可
   */
  private checkSongyangGateCheckpoint(event: CancellableEvent & MoveEventData): void {
    const mover = event.who;
    const dest = event.dest;

    if (!(mover instanceof PlayerBase)) return;
    if (!(dest instanceof RoomBase) || dest.id !== SONGYANG_GATE_ROOM_ID) return;
    if (!this.hasActiveGateGuard()) return;

    const sectData = mover.get<any>('sect');
    const currentSectId = sectData?.current?.sectId;
    if (currentSectId === 'songyang') return;

    const passUntil = mover.getTemp<number>(GATE_PASS_TEMP_KEY) ?? 0;
    if (passUntil > Date.now()) {
      // 一次性许可，放行时立刻消耗。
      mover.setTemp(GATE_PASS_TEMP_KEY, 0);
      return;
    }

    mover.receiveMessage('守山弟子横剑拦住去路：「报上来意。」');
    event.cancel();
  }

  private hasActiveGateGuard(): boolean {
    return this.getInventory().some((entity) => {
      if (!(entity instanceof NpcBase)) return false;
      if (!entity.id.startsWith(GATE_GUARD_ID_PREFIX)) return false;
      return !entity.isInCombat() && entity.getCombatState() !== 'dead';
    });
  }
}
