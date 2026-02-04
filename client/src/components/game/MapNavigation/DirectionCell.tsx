/**
 * 方向格子 — 3x3 导航网格中的单个格子
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import type { Direction } from '../../../stores/useGameStore';

interface DirectionCellProps {
  dir: Direction;
  onPress?: () => void;
}

export const DirectionCell = ({ dir, onPress }: DirectionCellProps) => (
  <TouchableOpacity
    style={[
      s.cell,
      dir.center && s.cellCenter,
      !dir.bold && !dir.center && s.cellDiag,
      dir.bold && !dir.center && s.cellCardinal,
    ]}
    onPress={onPress}
    disabled={dir.center}
  >
    <Text
      style={[
        s.text,
        dir.bold && s.textBold,
        dir.center && s.textCenter,
        !dir.bold && s.textDiag,
      ]}
    >
      {dir.text}
    </Text>
  </TouchableOpacity>
);

const s = StyleSheet.create({
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellDiag: {
    backgroundColor: '#E8E2D850',
  },
  cellCardinal: {
    backgroundColor: '#D5CFC540',
  },
  cellCenter: {
    backgroundColor: '#C5BFB560',
    borderWidth: 1,
    borderColor: '#8B7A5A60',
  },
  text: {
    fontFamily: 'Noto Serif SC',
  },
  textBold: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A5048',
  },
  textCenter: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A3530',
  },
  textDiag: {
    fontSize: 13,
    fontWeight: 'normal',
    color: '#8B7A5A80',
  },
});
