/**
 * 玩家名称徽章 — 名字左侧 + 等级徽章右对齐
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PlayerNameBadgeProps {
  name: string;
  level: string;
}

export const PlayerNameBadge = ({ name, level }: PlayerNameBadgeProps) => (
  <View style={s.row}>
    <Text style={s.name}>{name}</Text>
    <View style={s.badge}>
      <Text style={s.level}>{level}</Text>
    </View>
  </View>
);

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  badge: {
    borderWidth: 1,
    borderColor: '#8B7A5A80',
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  level: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
});
