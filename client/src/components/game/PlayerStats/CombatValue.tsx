/**
 * 攻防数值 — 攻击力/防御力展示
 * 水墨风格，与六维属性行对齐
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CombatValueProps {
  label: string;
  value: number;
}

export const CombatValue = ({ label, value }: CombatValueProps) => (
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
    color: '#8B4513',
    fontFamily: 'Noto Sans SC',
  },
});
