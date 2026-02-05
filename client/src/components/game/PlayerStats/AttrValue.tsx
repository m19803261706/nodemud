/**
 * 六维属性值 — 标签+数值纵向排列
 * 用于第二行六维属性展示（慧根/心眼/气海/脉络/筋骨/血气）
 * 有装备加成时显示绿色 "+N"
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AttrValueProps {
  label: string;
  value: number;
  bonus?: number;
}

export const AttrValue = ({ label, value, bonus = 0 }: AttrValueProps) => (
  <View style={s.container}>
    <Text style={s.label}>{label}</Text>
    <View style={s.valueRow}>
      <Text style={s.value}>{value}</Text>
      {bonus > 0 && <Text style={s.bonus}>+{bonus}</Text>}
    </View>
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
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  value: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3A3530',
    fontFamily: 'Noto Sans SC',
  },
  bonus: {
    fontSize: 9,
    fontWeight: '500',
    color: '#2F7A3F',
    fontFamily: 'Noto Sans SC',
  },
});
