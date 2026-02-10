/**
 * 经验信息栏 — 等级称号 + 经验条 + 潜能/阅历数值
 * 位于任务列表弹窗顶部
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from '../../LinearGradient';

interface ExpInfoBarProps {
  level: number;
  levelTitle: string;
  exp: number;
  expToNextLevel: number;
  potential: number;
  score: number;
}

export const ExpInfoBar = ({
  level,
  levelTitle,
  exp,
  expToNextLevel,
  potential,
  score,
}: ExpInfoBarProps) => {
  const expPct = expToNextLevel > 0 ? Math.min((exp / expToNextLevel) * 100, 100) : 0;

  return (
    <View style={s.container}>
      {/* 等级 + 称号 */}
      <View style={s.titleRow}>
        <Text style={s.levelText}>Lv.{level}</Text>
        <Text style={s.titleText}>{levelTitle || '---'}</Text>
      </View>

      {/* 经验条 */}
      <View style={s.expBarOuter}>
        <View style={s.expBarBg}>
          <LinearGradient
            colors={['#8B7A5A', '#A09060', '#8B7A5A']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[s.expBarFill, { width: `${expPct}%` }]}
          />
        </View>
        <Text style={s.expText}>
          {exp} / {expToNextLevel}
        </Text>
      </View>

      {/* 潜能 + 阅历 */}
      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Text style={s.statLabel}>潜能</Text>
          <Text style={s.statValue}>{potential}</Text>
        </View>
        <View style={s.statDot} />
        <View style={s.statItem}>
          <Text style={s.statLabel}>阅历</Text>
          <Text style={s.statValue}>{score}</Text>
        </View>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Sans SC',
  },
  titleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  expBarOuter: {
    gap: 3,
  },
  expBarBg: {
    height: 6,
    backgroundColor: '#D5CEC060',
    borderRadius: 3,
    overflow: 'hidden',
  },
  expBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 3,
  },
  expText: {
    fontSize: 10,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B5D4D',
    fontFamily: 'Noto Sans SC',
  },
  statDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#8B7A5A40',
  },
});
