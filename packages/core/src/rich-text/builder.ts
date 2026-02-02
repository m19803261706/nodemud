/**
 * 富文本标记协议 — 拼装工具函数
 * 后端蓝图/指令代码中使用，快速包裹语义和样式标记
 */

import type { SemanticTag } from './types';

/**
 * 包裹语义标记
 * @example rt('npc', '老镇长') → "[npc]老镇长[/npc]"
 * @example rt('damage', `受到 ${bold('128')} 点伤害`) → "[damage]受到 [b]128[/b] 点伤害[/damage]"
 */
export function rt(tag: SemanticTag, text: string): string {
  return `[${tag}]${text}[/${tag}]`;
}

/** 加粗 */
export function bold(text: string): string {
  return `[b]${text}[/b]`;
}

/** 斜体 */
export function italic(text: string): string {
  return `[i]${text}[/i]`;
}

/** 下划线 */
export function underline(text: string): string {
  return `[u]${text}[/u]`;
}
