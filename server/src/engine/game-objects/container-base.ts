/**
 * ContainerBase — 容器基类
 * 所有容器物品的基类（如包裹、箱子、残骸），提供容量限制、内容物查询等 API
 */
import { ItemBase } from './item-base';

export class ContainerBase extends ItemBase {
  static virtual = false;

  /** 获取容量（可放入物品数） */
  getCapacity(): number {
    return this.get<number>('capacity') ?? 10;
  }

  /** 获取重量限制 */
  getWeightLimit(): number {
    return this.get<number>('weight_limit') ?? 100;
  }

  /** 检查是否可接受物品放入 */
  canAccept(item: ItemBase): { ok: boolean; reason?: string } {
    const current = this.getContents().length;
    if (current >= this.getCapacity()) {
      return { ok: false, reason: '容器已满。' };
    }
    return { ok: true };
  }

  /** 获取内容物列表（仅 ItemBase 子类） */
  getContents(): ItemBase[] {
    return this.getInventory().filter(
      (e): e is ItemBase => e instanceof ItemBase,
    );
  }

  /** 获取内容物简要信息（用于网络传输） */
  getContentsBrief(): { id: string; name: string; short: string; type: string }[] {
    return this.getContents().map((item) => ({
      id: item.id,
      name: item.getName(),
      short: item.getShort(),
      type: item.getType(),
    }));
  }
}
