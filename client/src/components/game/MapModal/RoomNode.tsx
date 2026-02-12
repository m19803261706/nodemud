/**
 * RoomNode — 单个房间节点
 * 当前位置：金色边框 + 微光效果
 * 已探索：正常节点，半透明背景，显示房间名
 * 未探索：不渲染
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/** 节点尺寸 */
const NODE_SIZE = 56;

interface RoomNodeProps {
  name: string;
  x: number;
  y: number;
  isCurrent: boolean;
  isExplored: boolean;
  onPress?: () => void;
}

export const RoomNode = ({
  name,
  x,
  y,
  isCurrent,
  isExplored,
  onPress,
}: RoomNodeProps) => {
  if (!isExplored) return null;

  return (
    <TouchableOpacity
      style={[
        s.node,
        { left: x - NODE_SIZE / 2, top: y - NODE_SIZE / 2 },
        isCurrent && s.currentNode,
      ]}
      activeOpacity={isCurrent ? 1 : 0.7}
      disabled={isCurrent}
      onPress={onPress}
    >
      {isCurrent && <View style={s.glow} />}
      <Text style={[s.name, isCurrent && s.currentName]} numberOfLines={2}>
        {name}
      </Text>
    </TouchableOpacity>
  );
};

/** 导出节点尺寸供画布计算 */
export { NODE_SIZE };

const s = StyleSheet.create({
  node: {
    position: 'absolute',
    width: NODE_SIZE,
    height: NODE_SIZE,
    backgroundColor: '#F5F0E820',
    borderWidth: 1,
    borderColor: '#8B7A5A60',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  currentNode: {
    borderColor: '#D4A856',
    borderWidth: 2,
    backgroundColor: '#D4A85615',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: '#D4A85640',
    shadowColor: '#D4A856',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  name: {
    fontSize: 10,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    textAlign: 'center',
    lineHeight: 14,
  },
  currentName: {
    color: '#6B5A3A',
    fontWeight: '600',
  },
});
