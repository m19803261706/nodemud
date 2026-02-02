/**
 * 富文本标记协议 — 类型定义
 * 前后端共享的语义标记和解析节点类型
 */

/** 语义标记类型（14 个） */
export type SemanticTag =
  | 'rn'
  | 'rd'
  | 'exit'
  | 'npc'
  | 'player'
  | 'item'
  | 'damage'
  | 'heal'
  | 'sys'
  | 'combat'
  | 'skill'
  | 'chat'
  | 'emote'
  | 'imp';

/** 样式标记类型（3 个） */
export type StyleTag = 'b' | 'i' | 'u';

/** 所有标记类型 */
export type RichTag = SemanticTag | StyleTag;

/** 主题模式 */
export type ThemeMode = 'light' | 'dark';

/** 解析后的富文本节点 */
export interface RichTextNode {
  text: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}
