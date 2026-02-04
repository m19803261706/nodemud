/**
 * 地图描述 — 可垂直滚动的场景描述文本区域
 */

import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { GradientDivider } from '../shared';

interface MapDescriptionProps {
  text: string;
}

export const MapDescription = ({ text }: MapDescriptionProps) => (
  <View style={s.container}>
    <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
      <Text style={s.text}>{text}</Text>
    </ScrollView>
    <GradientDivider opacity={0.2} />
  </View>
);

const s = StyleSheet.create({
  container: {
    gap: 6,
  },
  scroll: {
    maxHeight: 80,
  },
  scrollContent: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  text: {
    fontSize: 13,
    lineHeight: 22,
    color: '#5A5550',
    fontFamily: 'Noto Serif SC',
  },
});
