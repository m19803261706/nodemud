/**
 * 描述开关按钮 — 切换地图描述显示/隐藏
 * 复用 LocationActionButton 同款样式，激活态高亮背景
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface DescToggleButtonProps {
  active: boolean;
  onPress: () => void;
}

export const DescToggleButton = ({ active, onPress }: DescToggleButtonProps) => (
  <TouchableOpacity style={[s.btn, active && s.btnActive]} onPress={onPress}>
    <Text style={[s.text, active && s.textActive]}>描述</Text>
  </TouchableOpacity>
);

const s = StyleSheet.create({
  btn: {
    borderWidth: 1,
    borderColor: '#8B7A5A60',
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnActive: {
    backgroundColor: '#C9C2B4',
    borderColor: '#8B7A5A',
  },
  text: {
    fontSize: 11,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  textActive: {
    color: '#3A3530',
  },
});
