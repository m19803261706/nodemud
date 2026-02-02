/**
 * NpcBase - NPC 基类
 *
 * 所有 NPC 对象的基类，继承 LivingBase。
 * 名字/描述能力由 LivingBase 提供，本类聚焦心跳 AI、对话等 NPC 专属能力。
 */
import { BaseEntity } from '../base-entity';
import { LivingBase } from './living-base';

export class NpcBase extends LivingBase {
  /** NPC 可克隆（非虚拟对象） */
  static virtual = false;

  /** 心跳回调，默认触发 onAI */
  public onHeartbeat(): void {
    this.onAI();
  }

  /** AI 行为钩子（蓝图覆写） */
  protected onAI(): void {}

  /** 对话接口（蓝图覆写） */
  onChat(speaker: BaseEntity, message: string): void {}
}
