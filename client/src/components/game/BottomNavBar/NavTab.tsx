/**
 * 导航标签 — 底部单个标签按钮
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface NavTabProps {
  label: string;
  active: boolean;
  onPress?: () => void;
}

export const NavTab = ({ label, active, onPress }: NavTabProps) => (
  <TouchableOpacity
    style={[s.tab, active && s.tabActive]}
    onPress={onPress}
  >
    <Text style={active ? s.labelActive : s.label}>{label}</Text>
  </TouchableOpacity>
);

const s = StyleSheet.create({
  tab: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#8B7A5A40',
  },
  tabActive: {
    backgroundColor: '#C9C2B4',
    borderColor: '#8B7A5A80',
  },
  label: {
    fontSize: 12,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  labelActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
});
