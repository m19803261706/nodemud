/**
 * MapLegend — 地图图例
 * 展示当前位置、已探索的图例说明
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/** 单个图例项 */
const LegendItem = ({
  label,
  borderColor,
  bgColor,
}: {
  label: string;
  borderColor: string;
  bgColor: string;
}) => (
  <View style={s.item}>
    <View style={[s.swatch, { borderColor, backgroundColor: bgColor }]} />
    <Text style={s.label}>{label}</Text>
  </View>
);

export const MapLegend = () => (
  <View style={s.container}>
    <LegendItem
      label="当前位置"
      borderColor="#D4A856"
      bgColor="#D4A85615"
    />
    <LegendItem
      label="已探索"
      borderColor="#8B7A5A60"
      bgColor="#F5F0E820"
    />
  </View>
);

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  swatch: {
    width: 12,
    height: 12,
    borderWidth: 1,
  },
  label: {
    fontSize: 10,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
});
