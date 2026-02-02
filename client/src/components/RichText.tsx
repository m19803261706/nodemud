/**
 * RichText 富文本渲染组件
 * 将带标记的字符串解析并渲染为带颜色和样式的 Text 组件
 * 支持语义标记（房间、NPC、物品等）和样式标记（加粗、斜体、下划线）
 */

import React from 'react';
import { Text, type TextStyle } from 'react-native';
import { parseRichText } from '../utils/parseRichText';
import type { ThemeMode } from '@packages/core';

/** RichText 组件属性 */
interface RichTextProps {
  /** 带标记的原始文本 */
  text: string;
  /** 主题模式，默认 light */
  theme?: ThemeMode;
  /** 外层 Text 样式 */
  style?: TextStyle;
}

/**
 * 富文本渲染组件
 * 将 [npc]张三[/npc] 等标记解析为带颜色的文本
 */
export const RichText: React.FC<RichTextProps> = ({
  text,
  theme = 'light',
  style,
}) => {
  const nodes = parseRichText(text, theme);

  return (
    <Text style={style}>
      {nodes.map((node, i) => (
        <Text
          key={i}
          style={{
            color: node.color,
            fontWeight: node.bold ? 'bold' : 'normal',
            fontStyle: node.italic ? 'italic' : 'normal',
            textDecorationLine: node.underline ? 'underline' : 'none',
          }}
        >
          {node.text}
        </Text>
      ))}
    </Text>
  );
};
