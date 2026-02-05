/**
 * KeyBase — 钥匙基类
 * 所有钥匙物品的基类，提供锁 ID、一次性等属性访问
 */
import { ItemBase } from './item-base';

export class KeyBase extends ItemBase {
  static virtual = false;

  /** 获取对应的锁 ID */
  getLockId(): string {
    return this.get<string>('lock_id') ?? '';
  }

  /** 是否一次性使用 */
  isSingleUse(): boolean {
    return this.get<boolean>('single_use') ?? true;
  }
}
