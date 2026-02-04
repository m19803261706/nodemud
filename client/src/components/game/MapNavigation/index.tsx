/**
 * 地图导航 — 3x3 方向网格
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useGameStore } from '../../../stores/useGameStore';
import { DirectionCell } from './DirectionCell';

export const MapNavigation = () => {
  const directions = useGameStore(state => state.directions);

  return (
    <View style={s.container}>
      {directions.map((row, ri) => (
        <View key={ri} style={s.row}>
          {row.map((dir, ci) => (
            <DirectionCell key={`${ri}-${ci}`} dir={dir} />
          ))}
        </View>
      ))}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    height: 120,
    backgroundColor: '#F5F0E830',
    borderWidth: 1,
    borderColor: '#8B7A5A30',
    padding: 8,
    gap: 4,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
});
