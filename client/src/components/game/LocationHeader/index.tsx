/**
 * 地点标题栏 — 地点名 + 操作按钮 + 渐变分隔线
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useGameStore } from '../../../stores/useGameStore';
import { GradientDivider } from '../shared';
import { LocationTitle } from './LocationTitle';
import { LocationActionButton } from './LocationActionButton';
import { DescToggleButton } from './DescToggleButton';

export const LocationHeader = () => {
  const location = useGameStore(state => state.location);
  const showMapDesc = useGameStore(state => state.showMapDesc);
  const toggleMapDesc = useGameStore(state => state.toggleMapDesc);

  return (
    <View style={s.container}>
      <View style={s.row}>
        <LocationTitle name={location.name} />
        <View style={s.btns}>
          {location.actions.map(label => (
            <LocationActionButton key={label} label={label} />
          ))}
          <DescToggleButton active={showMapDesc} onPress={toggleMapDesc} />
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
