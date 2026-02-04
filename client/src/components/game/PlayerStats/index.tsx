/**
 * 玩家状态栏 — 顶部区域
 * 包含：名称徽章 + 2 行属性条 + 渐变分隔线
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useGameStore } from '../../../stores/useGameStore';
import { StatBar, GradientDivider } from '../shared';
import { PlayerNameBadge } from './PlayerNameBadge';

export const PlayerStats = () => {
  const player = useGameStore(state => state.player);

  return (
    <View style={s.container}>
      <PlayerNameBadge name={player.name} level={player.level} />
      {player.stats.map((row, i) => (
        <View key={i} style={s.statsRow}>
          {row.map(stat => (
            <StatBar key={stat.label} {...stat} />
          ))}
        </View>
      ))}
      <GradientDivider opacity={0.38} />
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 0,
    gap: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
});
