/**
 * 物品/背包消息类型定义
 * 用于 roomInfo 物品列表和背包更新推送
 */

import type { ServerMessage } from '../base';

/** 物品简要信息（房间地面列表用） */
export interface ItemBrief {
  id: string;
  name: string;
  short: string;
  type: string;
  /** 是否为容器 */
  isContainer?: boolean;
  /** 是否为残骸（前端特殊样式） */
  isRemains?: boolean;
  /** 内容物数量（仅容器有值） */
  contentCount?: number;
}

/** 背包物品完整信息 */
export interface InventoryItem {
  id: string;
  name: string;
  short: string;
  type: string;
  weight: number;
  value: number;
  count: number;
  actions: string[];
  /** 动作文案 -> 指令映射（可选，兼容旧客户端） */
  actionCommands?: Record<string, string>;
}

/** 背包更新消息（服务端 → 客户端） */
export interface InventoryUpdateMessage extends ServerMessage {
  type: 'inventoryUpdate';
  data: {
    items: InventoryItem[];
  };
}
