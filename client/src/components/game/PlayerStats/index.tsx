/**
 * 玩家状态栏 — 顶部区域
 * 包含：名称徽章 + 3 进度条（气血/内力/精力） + 单行关键信息 + 渐变分隔线
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../../../stores/useGameStore';
import type { ResourceValue } from '../../../stores/useGameStore';
import { StatBar, GradientDivider } from '../shared';
import { PlayerNameBadge } from './PlayerNameBadge';

/** 资源值 → StatBar 百分比 */
function resourcePct(res: ResourceValue): number {
  return res.max > 0 ? Math.round((res.current / res.max) * 100) : 0;
}

/** 资源值 → StatBar 文本（max 为 0 时显示占位） */
function resourceText(res: ResourceValue): string {
  return res.max > 0 ? `${res.current}/${res.max}` : '--';
}

export const PlayerStats = () => {
  const player = useGameStore(state => state.player);

  /** 数据尚未到达（服务端未推送 playerStats） */
  const hasData = player.name.length > 0;

  return (
    <View style={s.container}>
      <PlayerNameBadge
        name={hasData ? player.name : '连接中…'}
        level={hasData ? player.levelTitle : ''}
      />

      {/* 第一行：气血/内力/精力 进度条 */}
      <View style={s.statsRow}>
        <StatBar
          label="气血"
          value={resourceText(player.hp)}
          pct={resourcePct(player.hp)}
          color="#A65D5D"
        />
        <StatBar
          label="内力"
          value={resourceText(player.mp)}
          pct={resourcePct(player.mp)}
          color="#4A6B6B"
        />
        <StatBar
          label="精力"
          value={resourceText(player.energy)}
          pct={resourcePct(player.energy)}
          color="#8B7355"
        />
      </View>

      {/* 第二行：单行关键信息（左到右） */}
      <View style={s.metaRow}>
        <View style={s.metaItem}>
          <Text style={s.metaLabel}>银两</Text>
          <Text style={s.metaValue}>{player.silver}</Text>
        </View>
        <View style={s.metaItem}>
          <Text style={s.metaLabel}>经验</Text>
          <Text style={s.metaValue}>{player.exp}</Text>
        </View>
        <View style={s.metaItem}>
          <Text style={s.metaLabel}>潜能</Text>
          <Text style={s.metaValue}>{player.potential}</Text>
        </View>
      </View>

      <GradientDivider opacity={0.38} />
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 0,
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  metaLabel: {
    fontSize: 10,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  metaValue: {
    fontSize: 11,
    color: '#8B4513',
    fontFamily: 'Noto Sans SC',
    fontWeight: '700',
  },
});
