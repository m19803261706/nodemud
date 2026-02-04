/**
 * 聊天按钮 — 底部右侧「聊天」按钮
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ChatInputButtonProps {
  onPress?: () => void;
}

export const ChatInputButton = ({ onPress }: ChatInputButtonProps) => (
  <TouchableOpacity style={s.btn} onPress={onPress}>
    <Text style={s.text}>聊天</Text>
  </TouchableOpacity>
);

const s = StyleSheet.create({
  btn: {
    backgroundColor: '#C9C2B4',
    borderWidth: 1,
    borderColor: '#8B7A5A60',
    paddingHorizontal: 16,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 11,
    fontWeight: '500',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
});
