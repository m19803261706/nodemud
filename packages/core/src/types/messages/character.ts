/**
 * 角色创建相关消息类型定义
 * 包含创建角色 4 步流程的请求和响应消息
 */

import type { ClientMessage, ServerMessage } from '../base';

/** 出身类型 */
export type CharacterOrigin =
  | 'noble' // 世家子弟
  | 'wanderer' // 江湖浪子
  | 'scholar' // 书院学子
  | 'soldier' // 边塞军卒
  | 'herbalist' // 山野药童
  | 'beggar'; // 乞丐流民

/** 六属性结构（三丹田六属性体系） */
export interface CharacterAttributes {
  wisdom: number; // 慧根（上丹田·神）
  perception: number; // 心眼（上丹田·神）
  spirit: number; // 气海（中丹田·气）
  meridian: number; // 脉络（中丹田·气）
  strength: number; // 筋骨（下丹田·精）
  vitality: number; // 血气（下丹田·精）
}

// ========== Step 1: 提交出身 ==========

/** 创建角色第一步：选择出身（Client → Server） */
export interface CreateCharacterStep1Message extends ClientMessage {
  type: 'createCharacterStep1';
  data: {
    origin: CharacterOrigin; // 出身选择
    gender: 'male' | 'female'; // 性别（预留）
  };
}

// ========== Step 2: 返回命格 ==========

/** 创建角色第二步：服务端返回命格结果（Server → Client） */
export interface CreateCharacterFateMessage extends ServerMessage {
  type: 'createCharacterFate';
  data: {
    fateName: string; // 命格名称（如"天机化变"）
    fatePoem: string; // 命格诗句
    fateType: string; // 命宫主星标识（如"tianji"）
    destiny: number; // 命数 1-5
    benefactor: number; // 贵人 1-5
    calamity: number; // 劫数 1-5
    fortune: number; // 机缘 1-5
    attributeCaps: CharacterAttributes; // 六属性上限（总和=42）
    wuxingju: string; // 五行局
    mingzhuStar: string; // 命主星
    shenzhuStar: string; // 身主星
  };
}

// ========== Step 3: 确认创建 ==========

/** 创建角色确认：提交分配和角色名（Client → Server） */
export interface CreateCharacterConfirmMessage extends ClientMessage {
  type: 'createCharacterConfirm';
  data: {
    name: string; // 角色名（2-6中文字符）
    origin: CharacterOrigin; // 出身（重复传递用于校验）
    attributes: CharacterAttributes; // 根基点分配（总和=18，每项≥1且≤上限）
  };
}

// ========== 创建结果 ==========

/** 角色创建成功响应（Server → Client） */
export interface CreateCharacterSuccessMessage extends ServerMessage {
  type: 'createCharacterSuccess';
  data: {
    characterId: string; // 角色 ID
    characterName: string; // 角色名
    message: string; // 提示信息
  };
}

/** 角色创建失败响应（Server → Client） */
export interface CreateCharacterFailedMessage extends ServerMessage {
  type: 'createCharacterFailed';
  data: {
    reason:
      | 'name_exists' // 角色名已存在
      | 'name_invalid' // 角色名格式不合法
      | 'already_has_character' // 已有角色
      | 'invalid_attributes' // 属性分配不合法
      | 'invalid_origin' // 出身不合法
      | 'session_expired' // 会话过期
      | 'fate_not_generated' // 命格未生成
      | 'server_error'; // 服务器错误
    message: string; // 中文错误提示
  };
}
