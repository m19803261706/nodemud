/**
 * 富文本标记协议 — 标记常量与色值表
 * 定义所有语义标记、样式标记和双主题色值
 */

import type { SemanticTag, StyleTag, ThemeMode } from './types';

/** 语义颜色标记（14 个） */
export const SEMANTIC_TAGS: Record<SemanticTag, SemanticTag> = {
  rn: 'rn', // 房间名称
  rd: 'rd', // 房间描述
  exit: 'exit', // 出口方向
  npc: 'npc', // NPC 名称
  player: 'player', // 玩家名称
  item: 'item', // 物品名称
  damage: 'damage', // 伤害
  heal: 'heal', // 恢复
  sys: 'sys', // 系统消息
  combat: 'combat', // 战斗动作
  skill: 'skill', // 技能名称
  chat: 'chat', // 聊天内容
  emote: 'emote', // 表情/动作
  imp: 'imp', // 重要提示
} as const;

/** 样式标记（3 个） */
export const STYLE_TAGS: Record<StyleTag, StyleTag> = {
  b: 'b', // 加粗
  i: 'i', // 斜体
  u: 'u', // 下划线
} as const;

/** 所有标记名称集合（供解析器使用） */
export const ALL_TAGS = new Set<string>([
  ...Object.keys(SEMANTIC_TAGS),
  ...Object.keys(STYLE_TAGS),
]);

/** 主题色值表 */
export const THEME_COLORS: Record<ThemeMode, Record<SemanticTag, string>> = {
  light: {
    rn: '#2B5B3C', // 深松绿
    rd: '#3A3530', // 深棕
    exit: '#2E6B8A', // 靛蓝
    npc: '#8B6914', // 暗金
    player: '#5B4FA0', // 紫蓝
    item: '#7A5C2E', // 棕铜
    damage: '#A03030', // 暗红
    heal: '#2F7A3F', // 翠绿
    sys: '#8B7A5A', // 土金
    combat: '#8B4513', // 鞍褐
    skill: '#6B2F8A', // 暗紫
    chat: '#3A3530', // 深色
    emote: '#6B5D4D', // 棕灰
    imp: '#C04020', // 朱红
  },
  dark: {
    rn: '#7BC89C',
    rd: '#D5CEC0',
    exit: '#6CB8D8',
    npc: '#D4A843',
    player: '#9B8FD0',
    item: '#C49A5C',
    damage: '#E06060',
    heal: '#5FBA6F',
    sys: '#A09580',
    combat: '#C07040',
    skill: '#A06FCA',
    chat: '#D5CEC0',
    emote: '#B0A090',
    imp: '#FF6040',
  },
} as const;
