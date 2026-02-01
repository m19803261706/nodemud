/**
 * WebSocket Service
 * 管理 WebSocket 连接、消息发送/接收、心跳检测
 */

import { MessageFactory } from '@packages/core';
import type { ServerMessage } from '@packages/core';

class WebSocketService {
  private ws: WebSocket | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private listeners = new Map<string, Set<(data: any) => void>>();

  /**
   * 连接到服务器
   * @param url WebSocket 服务器地址
   */
  connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('WebSocket 连接成功');
        this.startPing();
        resolve();
      };

      this.ws.onerror = error => {
        console.error('WebSocket 错误:', error);
        reject(error);
      };

      this.ws.onmessage = event => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = () => {
        console.log('WebSocket 连接关闭');
        this.stopPing();
      };
    });
  }

  /**
   * 发送消息
   * @param message 消息对象
   */
  send(message: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket 未连接');
      return;
    }
    this.ws.send(MessageFactory.serialize(message));
  }

  /**
   * 监听消息类型
   * @param type 消息类型
   * @param callback 回调函数
   */
  on(type: string, callback: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
  }

  /**
   * 取消监听
   * @param type 消息类型
   * @param callback 回调函数
   */
  off(type: string, callback: (data: any) => void) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * 处理接收到的消息
   * @param data JSON 字符串
   */
  private handleMessage(data: string) {
    const message = MessageFactory.deserialize<ServerMessage>(data);
    if (!message) {
      console.error('无效消息:', data);
      return;
    }

    // 分发消息到监听器
    const listeners = this.listeners.get(message.type);
    if (listeners) {
      listeners.forEach(callback => callback(message.data));
    }
  }

  /**
   * 启动心跳
   */
  private startPing() {
    this.pingInterval = setInterval(() => {
      this.send(MessageFactory.create('ping'));
    }, 30000); // 30 秒一次
  }

  /**
   * 停止心跳
   */
  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * 断开连接
   */
  disconnect() {
    this.stopPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsService = new WebSocketService();
