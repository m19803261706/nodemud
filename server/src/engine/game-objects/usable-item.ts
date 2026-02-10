/**
 * UsableItem 协议
 *
 * 为“可使用”物品提供统一抽象：
 * - 可声明多个使用选项（对应前端不同按钮）
 * - 每个选项执行独立逻辑（可消耗或不消耗）
 */
import type { LivingBase } from './living-base';
import type { ItemBase } from './item-base';

/** 使用选项 */
export interface UseOption {
  /** 稳定 key（指令参数中传递） */
  key: string;
  /** 前端按钮文案 */
  label: string;
}

/** 使用结果 */
export interface UseResult {
  success: boolean;
  message: string;
  /** 是否消耗当前物品（默认 true） */
  consume?: boolean;
  /** 是否引发资源变化（用于触发 playerStats 推送） */
  resourceChanged?: boolean;
  /** 自定义附加数据 */
  data?: Record<string, any>;
}

/** 可使用物品接口 */
export interface IUsableItem {
  /** 供前端渲染的可用选项（默认至少应包含一个） */
  getUseOptions(user?: LivingBase): UseOption[];
  /** 执行使用逻辑 */
  use(user: LivingBase, optionKey?: string): UseResult;
}

/** 运行时判断某个 Item 是否实现了可使用协议 */
export function isUsableItem(item: ItemBase): item is ItemBase & IUsableItem {
  const anyItem = item as any;
  return typeof anyItem.getUseOptions === 'function' && typeof anyItem.use === 'function';
}
