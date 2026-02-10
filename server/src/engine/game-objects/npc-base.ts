/**
 * NpcBase - NPC 基类
 *
 * 所有 NPC 对象的基类，继承 LivingBase。
 * 名字/描述能力由 LivingBase 提供，本类聚焦心跳 AI、对话等 NPC 专属能力。
 *
 * 闲聊系统：每次心跳检查 chat_chance 概率，命中则从 chat_msg 随机选一条广播。
 */
import { BaseEntity } from '../base-entity';
import { ServiceLocator } from '../service-locator';
import { ItemBase } from './item-base';
import { LivingBase } from './living-base';
import { RemainsBase } from './remains-base';
import { RoomBase } from './room-base';

export class NpcBase extends LivingBase {
  /** NPC 可克隆（非虚拟对象） */
  static virtual = false;

  /** 心跳回调，默认触发 onAI */
  public onHeartbeat(): void {
    this.onAI();
  }

  /**
   * AI 行为钩子
   * 默认实现：检查战斗状态，非战斗时执行闲聊
   * 蓝图可覆写扩展更多行为
   */
  protected onAI(): void {
    // 死亡状态不执行 AI
    if (this.getCombatState() === 'dead') return;

    // 战斗中执行战斗 AI（暂未实现）
    if (this.isInCombat()) {
      this.doCombatAI();
      return;
    }

    this.doChat();
  }

  /**
   * 战斗 AI 钩子（蓝图覆写实现具体战斗行为）
   * 默认实现为空，后续由战斗系统补充
   */
  protected doCombatAI(): void {
    // TODO: 战斗系统实现后补充默认战斗 AI
  }

  /** 闲聊：按 chat_chance 概率从 chat_msg 中随机广播一条 */
  protected doChat(): void {
    const chatChance = this.get<number>('chat_chance') || 0;
    if (chatChance <= 0) return;

    // 百分比概率判定
    if (Math.random() * 100 >= chatChance) return;

    const chatMsgs = this.get<string[]>('chat_msg');
    if (!chatMsgs || chatMsgs.length === 0) return;

    const msg = chatMsgs[Math.floor(Math.random() * chatMsgs.length)];
    const env = this.getEnvironment();
    if (env && env instanceof RoomBase) {
      env.broadcast(`[npc]${this.getName()}[/npc]${msg}`);
    }
  }

  /** NPC 失去环境（不在任何房间）→ 可清理 */
  public onCleanUp(): boolean {
    if (!this.getEnvironment()) return true;
    return false;
  }

  /**
   * NPC 死亡: 创建残骸容器，转移装备和物品到残骸，然后销毁自身
   */
  die(): void {
    super.die();
    const env = this.getEnvironment();
    const spawnBlueprintId = this.getTemp<string>('spawn/blueprintId');
    const spawnRoomId = this.getTemp<string>('spawn/roomId') ?? (env ? env.id : undefined);
    const spawnInterval = this.getTemp<number>('spawn/interval');

    // 创建残骸
    const remainsId = ServiceLocator.objectManager.nextInstanceId('remains');
    const remains = new RemainsBase(remainsId, this.getName());
    ServiceLocator.objectManager.register(remains);
    remains.enableHeartbeat(1000);

    // 转移装备到残骸
    for (const [pos, item] of this.getEquipment()) {
      if (item) {
        this.unequip(pos);
        item.moveTo(remains, { quiet: true });
      }
    }

    // 转移背包物品到残骸
    for (const child of [...this.getInventory()]) {
      if (child instanceof ItemBase) {
        child.moveTo(remains, { quiet: true });
      }
    }

    // 残骸放入房间
    if (env && env instanceof RoomBase) {
      remains.moveTo(env, { quiet: true });
      env.broadcast(`[npc]${this.getName()}[/npc]倒在了地上，留下了一具残骸。`);
    }

    // 通过 SpawnManager 刷新的 NPC 死亡后自动重生，避免任务怪被长期打空
    if (spawnBlueprintId && spawnRoomId && ServiceLocator.initialized && ServiceLocator.spawnManager) {
      const delayMs =
        typeof spawnInterval === 'number' && spawnInterval > 0 ? Math.floor(spawnInterval) : 60000;
      ServiceLocator.spawnManager.scheduleRespawn(spawnBlueprintId, spawnRoomId, delayMs);
    }

    // 销毁 NPC（inventory 已清空，不会散落物品）
    this.destroy();
  }

  /** 对话接口（蓝图覆写） */
  onChat(speaker: BaseEntity, message: string): void {}

  /**
   * 接收物品钩子（蓝图覆写）
   * 默认实现拒绝所有物品，蓝图可覆写实现特定 NPC 接受特定物品。
   * @returns accept: true 时物品移至 NPC，false 时留在玩家背包
   */
  onReceiveItem(_giver: LivingBase, _item: ItemBase): { accept: boolean; message?: string } {
    return {
      accept: false,
      message: `${this.getName()}不需要这个东西。`,
    };
  }
}
