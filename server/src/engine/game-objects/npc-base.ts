/**
 * NpcBase - NPC 基类
 *
 * 所有 NPC 对象的基类，继承 BaseEntity。
 * 提供名字、描述、心跳 AI、对话等 NPC 通用能力。
 */
import { BaseEntity } from '../base-entity';

export class NpcBase extends BaseEntity {
  /** NPC 可克隆（非虚拟对象） */
  static virtual = false;

  /** 获取 NPC 名字 */
  getName(): string {
    return this.get<string>('name') ?? '无名';
  }

  /** 获取简短描述（房间内显示） */
  getShort(): string {
    return this.get<string>('short') ?? this.getName();
  }

  /** 获取详细描述（look 查看） */
  getLong(): string {
    return this.get<string>('long') ?? `你看到了${this.getName()}。`;
  }

  /** 心跳回调，默认触发 onAI */
  public onHeartbeat(): void {
    this.onAI();
  }

  /** AI 行为钩子（蓝图覆写） */
  protected onAI(): void {}

  /** 对话接口（蓝图覆写） */
  onChat(speaker: BaseEntity, message: string): void {}
}
