/**
 * 血条 — 4px 高度的进度条
 * 用于 NPC 卡片的生命值展示
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

interface HpBarProps {
  pct: number;
  color: string;
}

export const HpBar = ({ pct, color }: HpBarProps) => (
  <View style={s.bg}>
    <View
      style={[s.fill, { width: `${pct}%` as any, backgroundColor: color }]}
    />
  </View>
);

const s = StyleSheet.create({
  bg: {
    height: 4,
    backgroundColor: '#D5CEC060',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
});
