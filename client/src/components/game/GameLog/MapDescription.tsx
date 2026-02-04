/**
 * 地图描述 — 可垂直滚动的场景描述文本区域
 */

import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';

interface MapDescriptionProps {
  text: string;
}

export const MapDescription = ({ text }: MapDescriptionProps) => (
  <View style={s.container}>
    <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
      <Text style={s.text}>{text}</Text>
    </ScrollView>
    <View style={s.divider} />
  </View>
);

const s = StyleSheet.create({
  container: {
    marginBottom: 8,
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
  divider: {
    height: 1,
    marginTop: 8,
    backgroundColor: '#8B7A5A50',
  },
});
