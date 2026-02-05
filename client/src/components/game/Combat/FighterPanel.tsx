/**
 * 战斗面板 -- 单方战斗者的 HP 条 + ATB 读条
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HpBar } from '../shared/HpBar';
import { AtbGauge } from './AtbGauge';

interface FighterPanelProps {
  name: string;
  hp: number;
  maxHp: number;
  atbPct: number;
  isPlayer: boolean;
}

/** HP 百分比 → 颜色 */
function hpColor(hp: number, maxHp: number): string {
  const pct = maxHp > 0 ? hp / maxHp : 0;
  if (pct > 0.5) return '#4A6B4A';
  if (pct > 0.2) return '#B8860B';
  return '#A65D5D';
}

export const FighterPanel = ({
  name,
  hp,
  maxHp,
  atbPct,
  isPlayer,
}: FighterPanelProps) => {
  const pct = maxHp > 0 ? Math.round((hp / maxHp) * 100) : 0;
  const color = hpColor(hp, maxHp);

  return (
    <View style={[s.container, isPlayer ? s.playerSide : s.enemySide]}>
      {/* 名字 + HP 数值 */}
      <View style={s.header}>
        <Text style={s.name}>{name}</Text>
        <Text style={[s.hpText, { color }]}>
          {hp}/{maxHp}
        </Text>
      </View>

      {/* HP 条 */}
      <HpBar pct={pct} color={color} />

      {/* ATB 读条 */}
      <View style={s.atbRow}>
        <Text style={s.atbLabel}>蓄力</Text>
        <View style={s.atbBar}>
          <AtbGauge percent={atbPct} />
        </View>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  playerSide: {},
  enemySide: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  hpText: {
    fontSize: 11,
    fontFamily: 'Noto Sans SC',
  },
  atbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  atbLabel: {
    fontSize: 10,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  atbBar: {
    flex: 1,
  },
});
