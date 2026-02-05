/**
 * 渐变分隔线 — 水墨风装饰元素
 * 通过 LinearGradient 模拟 transparent → 半透明 → transparent 的渐变效果
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from '../../LinearGradient';

interface GradientDividerProps {
  opacity?: number;
}

export const GradientDivider = ({ opacity = 0.38 }: GradientDividerProps) => (
  <LinearGradient
    colors={['transparent', `rgba(139,122,90,${opacity})`, 'transparent']}
    start={{ x: 0, y: 0.5 }}
    end={{ x: 1, y: 0.5 }}
    style={s.divider}
  />
);

const s = StyleSheet.create({
  divider: {
    height: 1,
  },
});
