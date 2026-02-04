/**
 * 玩家状态栏 — 顶部区域
 * 包含：名称徽章 + 3 进度条（气血/内力/精力） + 6 六维属性 + 渐变分隔线
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useGameStore } from '../../../stores/useGameStore';
import type { ResourceValue } from '../../../stores/useGameStore';
import { StatBar, GradientDivider } from '../shared';
import { PlayerNameBadge } from './PlayerNameBadge';
import { AttrValue } from './AttrValue';

/** 六维属性标签映射 */
const ATTR_LABELS: { key: keyof ReturnType<typeof useGameStore.getState>['player']['attrs']; label: string }[] = [
  { key: 'wisdom', label: '慧根' },
  { key: 'perception', label: '心眼' },
  { key: 'spirit', label: '气海' },
  { key: 'meridian', label: '脉络' },
  { key: 'strength', label: '筋骨' },
  { key: 'vitality', label: '血气' },
];

/** 资源值 → StatBar 百分比 */
function resourcePct(res: ResourceValue): number {
  return res.max > 0 ? Math.round((res.current / res.max) * 100) : 0;
}

/** 资源值 → StatBar 文本 */
function resourceText(res: ResourceValue): string {
  return `${res.current}/${res.max}`;
}

export const PlayerStats = () => {
  const player = useGameStore(state => state.player);

  return (
    <View style={s.container}>
      <PlayerNameBadge name={player.name} level={player.level} />

      {/* 第一行：气血/内力/精力 进度条 */}
      <View style={s.statsRow}>
        <StatBar label="气血" value={resourceText(player.hp)} pct={resourcePct(player.hp)} color="#A65D5D" />
        <StatBar label="内力" value={resourceText(player.mp)} pct={resourcePct(player.mp)} color="#4A6B6B" />
        <StatBar label="精力" value={resourceText(player.energy)} pct={resourcePct(player.energy)} color="#8B7355" />
      </View>

      {/* 第二行：六维属性数值 */}
      <View style={s.attrRow}>
        {ATTR_LABELS.map(({ key, label }) => (
          <AttrValue key={key} label={label} value={player.attrs[key]} />
        ))}
      </View>

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
  attrRow: {
    flexDirection: 'row',
    gap: 4,
  },
});
