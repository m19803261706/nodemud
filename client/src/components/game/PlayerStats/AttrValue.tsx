/**
 * 六维属性值 — 标签+数值纵向排列
 * 用于第二行六维属性展示（慧根/心眼/气海/脉络/筋骨/血气）
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AttrValueProps {
  label: string;
  value: number;
}

export const AttrValue = ({ label, value }: AttrValueProps) => (
  <View style={s.container}>
    <Text style={s.label}>{label}</Text>
    <Text style={s.value}>{value}</Text>
  </View>
);

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  label: {
    fontSize: 10,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  value: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3A3530',
    fontFamily: 'Noto Sans SC',
  },
});
