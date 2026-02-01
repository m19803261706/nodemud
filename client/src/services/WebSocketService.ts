/**
 * WebSocket Service
 * 管理 WebSocket 连接、消息发送/接收、心跳检测
 */

import { MessageFactory } from '@packages/core';
import type { ServerMessage } from '@packages/core';

class WebSocketService {
  private ws: WebSocket | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners = new Map<string, Set<(data: any) => void>>();
  private serverUrl: string = '';
  private shouldReconnect: boolean = false;
  private reconnectDelay: number = 3000;

  /**
   * 连接到服务器
   * App 启动时调用一次，后续断线会自动重连
   * @param url WebSocket 服务器地址
   */
  connect(url: string): Promise<void> {
    this.serverUrl = url;
    this.shouldReconnect = true;
    this.clearReconnectTimer();

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('WebSocket 连接成功');
        this.reconnectDelay = 3000; // 重置重连延迟
        this.startPing();
        this.emit('connectionChanged', { connected: true });
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
        this.emit('connectionChanged', { connected: false });
        this.scheduleReconnect();
      };
    });
  }

  /**
   * 分发事件到监听器
   */
  private emit(type: string, data: any) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  /**
   * 计划断线重连
   */
  private scheduleReconnect() {
    if (!this.shouldReconnect || !this.serverUrl) {
      return;
    }
    this.clearReconnectTimer();
    console.log(`将在 ${this.reconnectDelay / 1000}s 后尝试重连...`);
    this.reconnectTimer = setTimeout(() => {
      console.log('正在重连...');
      this.connect(this.serverUrl).catch(() => {
        // 递增延迟，上限 30 秒
        this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 30000);
      });
    }, this.reconnectDelay);
  }

  /**
   * 清除重连定时器
   */
  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * 检查连接状态
   */
  get isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * 发送消息
   * @param message 消息对象
   * @returns 是否发送成功
   */
  send(message: any): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket 未连接');
      return false;
    }
    this.ws.send(MessageFactory.serialize(message));
    return true;
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
    this.emit(message.type, message.data);
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
   * 断开连接（主动断开，不再自动重连）
   */
  disconnect() {
    this.shouldReconnect = false;
    this.clearReconnectTimer();
    this.stopPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsService = new WebSocketService();
