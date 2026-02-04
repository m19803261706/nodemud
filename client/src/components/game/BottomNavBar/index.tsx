/**
 * 底部导航栏 — 5 个标签（人物/技能/江湖/门派/背包）
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useGameStore } from '../../../stores/useGameStore';
import { NavTab } from './NavTab';

const TAB_LABELS = ['人物', '技能', '江湖', '门派', '背包'];

export const BottomNavBar = () => {
  const activeTab = useGameStore(state => state.activeTab);
  const setActiveTab = useGameStore(state => state.setActiveTab);

  return (
    <View style={s.container}>
      {TAB_LABELS.map(label => (
        <NavTab
          key={label}
          label={label}
          active={label === activeTab}
          onPress={() => setActiveTab(label)}
        />
      ))}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#8B7A5A20',
  },
});
