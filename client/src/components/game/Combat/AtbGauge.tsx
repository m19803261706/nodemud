/**
 * ATB 读条进度条
 * 水墨风渐变进度条，从浅棕到深棕
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

interface AtbGaugeProps {
  /** 读条百分比 0-100 */
  percent: number;
}

export const AtbGauge = ({ percent }: AtbGaugeProps) => {
  const clampedPct = Math.max(0, Math.min(100, percent));

  return (
    <View style={s.bg}>
      <View style={[s.fill, { width: `${clampedPct}%` as any }]} />
    </View>
  );
};

const s = StyleSheet.create({
  bg: {
    height: 6,
    backgroundColor: '#D5CEC060',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#8B7A5A',
    borderRadius: 3,
  },
});
