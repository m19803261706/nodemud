/**
 * 单条聊天消息 — 彩色文本行
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface ChatMessageProps {
  text: string;
  color: string;
}

export const ChatMessage = ({ text, color }: ChatMessageProps) => (
  <Text style={[s.text, { color }]}>{text}</Text>
);

const s = StyleSheet.create({
  text: {
    fontSize: 11,
    lineHeight: 11 * 1.3,
    fontFamily: 'Noto Serif SC',
  },
});
