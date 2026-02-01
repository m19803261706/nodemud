/**
 * UI 提示消息类型定义
 * 包含 Alert 和 Toast 通用提示
 */

import type { ServerMessage } from '../base';

/** 消息级别 */
export type MessageLevel = 'info' | 'success' | 'warning' | 'error';

/** Alert 提示消息 */
export interface AlertMessage extends ServerMessage {
  type: 'alert';
  data: {
    title: string; // 标题
    message: string; // 内容
    level: MessageLevel; // 级别
    duration?: number; // 显示时长（毫秒），undefined 表示需要手动关闭
  };
}

/** Toast 提示消息 */
export interface ToastMessage extends ServerMessage {
  type: 'toast';
  data: {
    message: string; // 提示内容
    level: MessageLevel; // 级别
    duration?: number; // 显示时长（毫秒），默认 3000
  };
}
