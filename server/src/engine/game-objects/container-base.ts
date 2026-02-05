/**
 * ContainerBase — 容器基类
 * 所有容器物品的基类（如包裹、箱子），提供容量、重量限制等属性访问
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
}
