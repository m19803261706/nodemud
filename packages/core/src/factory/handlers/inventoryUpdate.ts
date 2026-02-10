/**
 * 背包更新消息处理器
 * 服务端推送玩家背包物品列表给客户端
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { InventoryUpdateMessage, InventoryItem } from '../../types/messages/inventory';

@MessageHandler('inventoryUpdate')
export class InventoryUpdateHandler implements IMessageHandler {
  create(items: InventoryItem[]): InventoryUpdateMessage {
    return {
      type: 'inventoryUpdate',
      data: { items },
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      Array.isArray(data.items) &&
      data.items.every(
        (item: any) =>
          typeof item.id === 'string' &&
          typeof item.name === 'string' &&
          typeof item.type === 'string' &&
          typeof item.weight === 'number' &&
          typeof item.value === 'number' &&
          typeof item.count === 'number' &&
          Array.isArray(item.actions) &&
          item.actions.every((action: any) => typeof action === 'string') &&
          (item.actionCommands === undefined ||
            (typeof item.actionCommands === 'object' &&
              item.actionCommands !== null &&
              !Array.isArray(item.actionCommands) &&
              Object.values(item.actionCommands).every((command: any) => typeof command === 'string'))),
      )
    );
  }
}
