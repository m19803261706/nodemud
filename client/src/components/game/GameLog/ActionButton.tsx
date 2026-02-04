/**
 * 动作按钮 — 底部动作栏（拜师/领取任务/打坐）
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ActionButtonProps {
  label: string;
  onPress?: () => void;
}

export const ActionButton = ({ label, onPress }: ActionButtonProps) => (
  <TouchableOpacity style={s.btn} onPress={onPress}>
    <Text style={s.text}>{label}</Text>
  </TouchableOpacity>
);

const s = StyleSheet.create({
  btn: {
    backgroundColor: '#E8E2D660',
    borderWidth: 1,
    borderColor: '#8B7A5A40',
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 11,
    color: '#5A5048',
    fontFamily: 'Noto Serif SC',
  },
});
