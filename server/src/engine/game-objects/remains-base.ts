/**
 * RemainsBase — 残骸基类
 * 生物死亡后留下的容器物品，包含死亡时掉落的装备和物品。
 * 通过心跳驱动衰腐倒计时，10 分钟后自动销毁（内容物一并消失）。
 */
import { ContainerBase } from './container-base';

/** 默认腐烂时间（秒） */
const DEFAULT_DECAY_SECONDS = 600;

export class RemainsBase extends ContainerBase {
  static virtual = false;

  /** 腐烂剩余时间（秒） */
  private decayRemaining: number;

  constructor(id: string, sourceName: string) {
    super(id);
    this.set('name', `${sourceName}的残骸`);
    this.set('short', `${sourceName}的残骸`);
    this.set('long', `${sourceName}的残骸，散发着余温。`);
    this.set('type', 'remains');
    this.set('source_name', sourceName);
    this.set('droppable', true);
    this.set('tradeable', false);
    this.set('stackable', false);
    this.set('capacity', 50);
    this.decayRemaining = DEFAULT_DECAY_SECONDS;
  }

  /** 心跳回调：衰腐倒计时 */
  public onHeartbeat(): void {
    this.decayRemaining -= 1;
    if (this.decayRemaining <= 0) {
      this.decay();
    }
  }

  /** 腐烂消失：广播消息后销毁 */
  private decay(): void {
    const env = this.getEnvironment();
    if (env) {
      // 延迟引入避免循环依赖
      const { RoomBase } = require('./room-base');
      if (env instanceof RoomBase) {
        (env as any).broadcast(
          `[item]${this.getName()}[/item]化为尘土，消散了。`,
        );
      }
    }
    this.destroy();
  }

  /** 覆写：销毁时内容物一并消失，不散落到上层 */
  protected handleInventoryOnDestroy(): void {
    for (const child of [...this.getInventory()]) {
      child.destroy();
    }
  }

  /** 覆写：无环境时可被 GC 回收 */
  public onCleanUp(): boolean {
    return !this.getEnvironment();
  }
}
