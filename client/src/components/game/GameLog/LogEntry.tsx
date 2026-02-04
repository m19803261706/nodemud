/**
 * 单条日志 — 支持富文本标记的彩色文本行
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { RichText } from '../../RichText';

interface LogEntryProps {
  text: string;
  color: string;
}

export const LogEntry = ({ text, color }: LogEntryProps) => (
  <RichText text={text} style={{ ...s.text, color }} />
);

const s = StyleSheet.create({
  text: {
    fontSize: 12,
    lineHeight: 12 * 1.4,
    fontFamily: 'Noto Serif SC',
  },
});
