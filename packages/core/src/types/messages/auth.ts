/**
 * 认证相关消息类型定义
 * 包含登录、注册的请求和响应消息
 */

import type { ClientMessage, ServerMessage } from '../base';

// ========== 登录 ==========

/** 登录请求 */
export interface LoginMessage extends ClientMessage {
  type: 'login';
  data: {
    username: string; // 用户名
    password: string; // 密码（明文，后端验证加密）
  };
}

/** 登录成功响应 */
export interface LoginSuccessMessage extends ServerMessage {
  type: 'loginSuccess';
  data: {
    accountId: string; // 账号 ID
    username: string; // 用户名
    hasCharacter: boolean; // 是否已创建角色
    characterId?: string; // 角色 ID（如果有）
    characterName?: string; // 角色名（如果有）
    message: string; // 提示信息
  };
}

/** 登录失败响应 */
export interface LoginFailedMessage extends ServerMessage {
  type: 'loginFailed';
  data: {
    reason:
      | 'account_not_found'
      | 'invalid_password'
      | 'account_banned'
      | 'server_error';
    message: string; // 中文错误提示
  };
}

// ========== 注册 ==========

/** 注册请求 */
export interface RegisterMessage extends ClientMessage {
  type: 'register';
  data: {
    username: string; // 用户名（3-20字符）
    password: string; // 密码（6+字符，包含数字+字母）
    phone: string; // 手机号（11位）
  };
}

/** 注册成功响应 */
export interface RegisterSuccessMessage extends ServerMessage {
  type: 'registerSuccess';
  data: {
    accountId: string; // 账号 ID
    username: string; // 用户名
    message: string; // 提示信息
  };
}

/** 注册失败响应 */
export interface RegisterFailedMessage extends ServerMessage {
  type: 'registerFailed';
  data: {
    reason:
      | 'username_exists'
      | 'phone_exists'
      | 'invalid_password'
      | 'invalid_phone'
      | 'server_error';
    message: string; // 中文错误提示
  };
}
