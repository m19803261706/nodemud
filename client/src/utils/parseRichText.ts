/**
 * 富文本解析器
 * 将带有标记的字符串解析为 RichTextNode 数组
 * 使用正则状态机，支持语义标记（颜色）和样式标记（加粗/斜体/下划线）
 * 最大嵌套深度为 3 层
 */

import {
  ALL_TAGS,
  SEMANTIC_TAGS,
  THEME_COLORS,
  type RichTextNode,
  type ThemeMode,
  type SemanticTag,
} from '@packages/core';

/** 最大嵌套深度 */
const MAX_DEPTH = 3;

/** 标记匹配正则：匹配 [tag]、[/tag] 或 [\/tag]（兼容旧文案） */
const TAG_REGEX = /\[(\\?\/?)([\w]+)\]/g;

/** 旧标记兼容映射（服务端历史文案） */
const TAG_ALIAS: Record<string, string> = {
  important: 'imp',
};

/** 样式状态 */
interface StyleState {
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

/**
 * 解析富文本字符串为节点数组
 * @param raw - 原始带标记的字符串
 * @param theme - 主题模式，决定语义标记的颜色
 * @returns 解析后的富文本节点数组
 */
export function parseRichText(
  raw: string,
  theme: ThemeMode = 'light',
): RichTextNode[] {
  const nodes: RichTextNode[] = [];
  const colors = THEME_COLORS[theme];
  const stack: StyleState[] = [];
  let currentStyle: StyleState = {};
  let lastIndex = 0;

  // 重置正则状态
  TAG_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TAG_REGEX.exec(raw)) !== null) {
    const [fullMatch, closeToken, rawTagName] = match;
    const tagName = TAG_ALIAS[rawTagName] ?? rawTagName;

    // 非预定义标记 -> 当作纯文本跳过
    if (!ALL_TAGS.has(tagName)) continue;

    // 输出标记前的纯文本
    if (match.index > lastIndex) {
      const text = raw.slice(lastIndex, match.index);
      if (text) nodes.push({ text, ...currentStyle });
    }
    lastIndex = match.index + fullMatch.length;

    const isClose = closeToken.includes('/');
    if (isClose) {
      // 关闭标记 -> 弹栈恢复上层样式
      if (stack.length > 0) {
        currentStyle = stack.pop()!;
      }
    } else {
      // 开启标记 -> 压栈保存当前样式
      if (stack.length >= MAX_DEPTH) continue;
      stack.push({ ...currentStyle });

      if (tagName in SEMANTIC_TAGS) {
        // 语义标记：应用主题颜色
        currentStyle = {
          ...currentStyle,
          color: colors[tagName as SemanticTag],
        };
      } else if (tagName === 'b') {
        currentStyle = { ...currentStyle, bold: true };
      } else if (tagName === 'i') {
        currentStyle = { ...currentStyle, italic: true };
      } else if (tagName === 'u') {
        currentStyle = { ...currentStyle, underline: true };
      }
    }
  }

  // 输出剩余纯文本
  if (lastIndex < raw.length) {
    const text = raw.slice(lastIndex);
    if (text) nodes.push({ text, ...currentStyle });
  }

  return nodes;
}
