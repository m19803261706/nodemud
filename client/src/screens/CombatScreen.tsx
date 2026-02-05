/**
 * 战斗页面 -- 纯布局容器，挂载 Combat 区域组件
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Combat } from '../components/game/Combat';

const CombatScreen = () => (
  <View style={s.container}>
    <Combat />
  </View>
);

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0E8' },
});

export default CombatScreen;
