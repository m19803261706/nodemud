/**
 * 单条日志 — 彩色文本行
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface LogEntryProps {
  text: string;
  color: string;
}

export const LogEntry = ({ text, color }: LogEntryProps) => (
  <Text style={[s.text, { color }]}>{text}</Text>
);

const s = StyleSheet.create({
  text: {
    fontSize: 12,
    lineHeight: 12 * 1.4,
    fontFamily: 'Noto Serif SC',
  },
});
