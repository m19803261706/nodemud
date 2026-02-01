/**
 * Session 类型定义
 * 存储 WebSocket 连接的状态信息
 */

export interface Session {
  socketId: string; // Socket ID
  authenticated: boolean; // 是否已认证
  accountId?: string; // 账号 ID（认证后）
  username?: string; // 用户名（认证后）
  lastPing?: number; // 最后心跳时间（毫秒）
}
