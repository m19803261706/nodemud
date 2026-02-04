/**
 * NpcBase - NPC 基类
 *
 * 所有 NPC 对象的基类，继承 LivingBase。
 * 名字/描述能力由 LivingBase 提供，本类聚焦心跳 AI、对话等 NPC 专属能力。
 *
 * 闲聊系统：每次心跳检查 chat_chance 概率，命中则从 chat_msg 随机选一条广播。
 */
import { BaseEntity } from '../base-entity';
import { LivingBase } from './living-base';
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
   * 默认实现：闲聊系统（chat_chance + chat_msg）
   * 蓝图可覆写扩展更多行为
   */
  protected onAI(): void {
    this.doChat();
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

  /** 对话接口（蓝图覆写） */
  onChat(speaker: BaseEntity, message: string): void {}
}
