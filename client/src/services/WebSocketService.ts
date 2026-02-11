/**
 * WebSocket Service
 * 管理 WebSocket 连接、消息发送/接收、心跳检测
 */

import { MessageFactory } from '@packages/core';
import type { ServerMessage } from '@packages/core';

class WebSocketService {
  private ws: WebSocket | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connectPromise: Promise<void> | null = null;
  private listeners = new Map<string, Set<(data: any) => void>>();
  private serverUrl: string = '';
  private shouldReconnect: boolean = false;
  private reconnectDelay: number = 3000;
  private socketVersion: number = 0;

  /**
   * 连接到服务器
   * App 启动时调用一次，后续断线会自动重连
   * @param url WebSocket 服务器地址
   */
  connect(url: string): Promise<void> {
    this.serverUrl = url;
    this.shouldReconnect = true;
    this.clearReconnectTimer();

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      return this.connectPromise ?? Promise.resolve();
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    const socketVersion = ++this.socketVersion;
    const socket = new WebSocket(url);
    this.ws = socket;

    this.connectPromise = new Promise((resolve, reject) => {
      let settled = false;
      const settleResolve = () => {
        if (!settled) {
          settled = true;
          this.connectPromise = null;
          resolve();
        }
      };
      const settleReject = (error: any) => {
        if (!settled) {
          settled = true;
          this.connectPromise = null;
          reject(error);
        }
      };

      socket.onopen = () => {
        if (this.ws !== socket || socketVersion !== this.socketVersion) return;
        console.log('WebSocket 连接成功');
        this.reconnectDelay = 3000; // 重置重连延迟
        this.startPing();
        this.emit('connectionChanged', { connected: true });
        settleResolve();
      };

      socket.onerror = error => {
        if (this.ws !== socket || socketVersion !== this.socketVersion) return;
        console.error('WebSocket 错误:', error);
        settleReject(error);
      };

      socket.onmessage = event => {
        if (this.ws !== socket || socketVersion !== this.socketVersion) return;
        this.handleMessage(event.data);
      };

      socket.onclose = () => {
        if (this.ws !== socket || socketVersion !== this.socketVersion) return;
        console.log('WebSocket 连接关闭');
        this.stopPing();
        this.emit('connectionChanged', { connected: false });
        this.ws = null;
        this.connectPromise = null;
        this.scheduleReconnect();
      };
    });

    return this.connectPromise;
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
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }
    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      return;
    }
    this.clearReconnectTimer();
    console.log(`将在 ${this.reconnectDelay / 1000}s 后尝试重连...`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
      if (this.ws && this.ws.readyState === WebSocket.CONNECTING) return;
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
    // NestJS WsAdapter 要求 { event, data } 格式路由到 @SubscribeMessage
    const payload = JSON.stringify({
      event: 'message',
      data: MessageFactory.serialize(message),
    });
    this.ws.send(payload);
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
   * @param raw JSON 字符串
   */
  private handleMessage(raw: string) {
    const message = MessageFactory.deserialize<ServerMessage>(raw);
    if (!message) {
      // 尝试直接 JSON 解析（部分消息未走 MessageFactory）
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.type) {
          this.emit(parsed.type, parsed.data);
          return;
        }
      } catch {}
      console.error('无效消息:', raw);
      return;
    }
    // 分发消息到监听器
    this.emit(message.type, message.data);
  }

  /**
   * 启动心跳
   */
  private startPing() {
    this.stopPing();
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
    this.connectPromise = null;
    this.socketVersion++;

    const socket = this.ws;
    this.ws = null;
    if (socket) {
      socket.close();
    }
  }
}

export const wsService = new WebSocketService();
