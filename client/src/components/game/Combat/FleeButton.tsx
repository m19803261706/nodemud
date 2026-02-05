/**
 * 逃跑按钮 -- 水墨风样式
 * 点击后发送 flee 指令
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface FleeButtonProps {
  onFlee: () => void;
  disabled?: boolean;
}

export const FleeButton = ({ onFlee, disabled = false }: FleeButtonProps) => (
  <TouchableOpacity
    style={[s.button, disabled && s.disabled]}
    onPress={onFlee}
    disabled={disabled}
    activeOpacity={0.7}
  >
    <Text style={[s.text, disabled && s.disabledText]}>逃跑</Text>
  </TouchableOpacity>
);

const s = StyleSheet.create({
  button: {
    alignSelf: 'center',
    backgroundColor: '#8B7A5A',
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 4,
    marginVertical: 8,
  },
  disabled: {
    backgroundColor: '#D5CEC0',
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F5F0E8',
    fontFamily: 'Noto Serif SC',
  },
  disabledText: {
    color: '#A09888',
  },
});
