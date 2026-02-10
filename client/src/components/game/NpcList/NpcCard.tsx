/**
 * NPC 卡片 — 名字+性别+等级+血条+势力
 * 颜色根据 attitude 动态计算
 */

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import type { NpcData } from '../../../stores/useGameStore';
import { HpBar } from '../shared';

/** 态度 → 颜色 */
const ATTITUDE_COLORS: Record<string, string> = {
  friendly: '#2F5D3A',
  neutral: '#8B7A5A',
  aggressive: '#8B2500',
};

/** 态度 → 血条颜色 */
const HP_COLORS: Record<string, string> = {
  friendly: '#5A8A6A',
  neutral: '#6A8A9A',
  aggressive: '#8B4A4A',
};

interface NpcCardProps {
  npc: NpcData;
  onPress?: () => void;
}

export const NpcCard = ({ npc, onPress }: NpcCardProps) => {
  const mainColor = ATTITUDE_COLORS[npc.attitude] || '#8B7A5A';
  const hpColor = HP_COLORS[npc.attitude] || '#6A8A9A';
  const genderIcon = npc.gender === 'male' ? '♂' : '♀';
  const genderColor = npc.gender === 'male' ? '#4A90D9' : '#D94A7A';
  const displayName = npc.title ? `「${npc.title}」${npc.name}` : npc.name;

  return (
    <TouchableOpacity
      style={[s.card, { borderColor: mainColor + '40' }]}
      onPress={onPress}
    >
      {/* 任务角标 */}
      {npc.hasQuestReady && <Text style={s.questBadgeReady}>!</Text>}
      {npc.hasQuest && !npc.hasQuestReady && (
        <Text style={s.questBadge}>?</Text>
      )}
      <View style={s.top}>
        <Text style={[s.name, { color: mainColor }]}>{displayName}</Text>
        <Text style={[s.gender, { color: genderColor }]}>{genderIcon}</Text>
      </View>
      <View style={s.info}>
        <Text style={s.level}>{npc.level}级</Text>
        {npc.faction ? <Text style={s.faction}>{npc.faction}</Text> : null}
      </View>
      <HpBar pct={npc.hpPct} color={hpColor} />
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  card: {
    padding: 6,
    gap: 4,
    borderWidth: 1,
    marginBottom: 6,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Noto Serif SC',
  },
  gender: {
    fontSize: 10,
    fontFamily: 'Noto Sans SC',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  level: {
    fontSize: 10,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  faction: {
    fontSize: 9,
    color: '#6B5D4D',
    fontFamily: 'Noto Sans SC',
  },
  questBadge: {
    position: 'absolute',
    top: 2,
    right: 4,
    fontSize: 14,
    fontWeight: '700',
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
    zIndex: 1,
  },
  questBadgeReady: {
    position: 'absolute',
    top: 2,
    right: 4,
    fontSize: 14,
    fontWeight: '700',
    color: '#D4A017',
    fontFamily: 'Noto Sans SC',
    zIndex: 1,
  },
});
