/**
 * 地点操作按钮 — 边框文字按钮（回城/飞行/地图/邮件）
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface LocationActionButtonProps {
  label: string;
  onPress?: () => void;
}

export const LocationActionButton = ({
  label,
  onPress,
}: LocationActionButtonProps) => (
  <TouchableOpacity style={s.btn} onPress={onPress}>
    <Text style={s.text}>{label}</Text>
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
  text: {
    fontSize: 11,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
});
