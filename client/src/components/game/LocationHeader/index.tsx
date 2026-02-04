/**
 * 地点标题栏 — 地点名 + 操作按钮 + 渐变分隔线
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useGameStore } from '../../../stores/useGameStore';
import { GradientDivider } from '../shared';
import { LocationTitle } from './LocationTitle';
import { LocationActionButton } from './LocationActionButton';

export const LocationHeader = () => {
  const location = useGameStore(state => state.location);

  return (
    <View style={s.container}>
      <View style={s.row}>
        <LocationTitle name={location.name} />
        <View style={s.btns}>
          {location.actions.map(label => (
            <LocationActionButton key={label} label={label} />
          ))}
        </View>
      </View>
      <GradientDivider opacity={0.25} />
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btns: {
    flexDirection: 'row',
    gap: 6,
  },
});
