/**
 * NPC 卡片 — 名字+性别+等级+血条
 */

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import type { NpcData } from '../../../stores/useGameStore';
import { HpBar } from '../shared';

interface NpcCardProps {
  npc: NpcData;
  onPress?: () => void;
}

export const NpcCard = ({ npc, onPress }: NpcCardProps) => (
  <TouchableOpacity
    style={[s.card, { borderColor: npc.borderColor }]}
    onPress={onPress}
  >
    <View style={s.top}>
      <Text style={[s.name, { color: npc.nameColor }]}>{npc.name}</Text>
      <Text style={[s.gender, { color: npc.genderColor }]}>{npc.gender}</Text>
    </View>
    <Text style={s.level}>{npc.level}</Text>
    <HpBar pct={npc.hpPct} color={npc.hpColor} />
  </TouchableOpacity>
);

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
  level: {
    fontSize: 10,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
});
