/**
 * 属性条 — 标签+数值横向排列，下方 4px 进度条
 * 用于玩家状态栏的气血/内力/经验等属性展示
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatBarProps {
  label: string;
  value: string;
  pct: number;
  color: string;
}

export const StatBar = ({ label, value, pct, color }: StatBarProps) => (
  <View style={s.container}>
    <View style={s.header}>
      <Text style={s.label}>{label}</Text>
      <Text style={[s.value, { color }]}>{value}</Text>
    </View>
    <View style={s.barBg}>
      <View style={[s.barFill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  </View>
);

const s = StyleSheet.create({
  container: {
    flex: 1,
    gap: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  value: {
    fontSize: 9,
    fontFamily: 'Noto Sans SC',
  },
  barBg: {
    height: 4,
    backgroundColor: '#D5CEC060',
  },
  barFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
});
