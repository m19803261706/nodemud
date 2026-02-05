/**
 * 装备栏更新消息处理器
 * 服务端推送玩家装备槽位状态给客户端
 */

import { MessageHandler, type IMessageHandler } from '../MessageFactory';
import type { EquipmentUpdateMessage, EquipmentData } from '../../types/messages/equipment';

@MessageHandler('equipmentUpdate')
export class EquipmentUpdateHandler implements IMessageHandler {
  create(equipment: EquipmentData): EquipmentUpdateMessage {
    return {
      type: 'equipmentUpdate',
      data: { equipment },
      timestamp: Date.now(),
    };
  }

  validate(data: any): boolean {
    return (
      data.equipment !== null &&
      typeof data.equipment === 'object' &&
      !Array.isArray(data.equipment)
    );
  }
}
