/**
 * NPC 列表 — 右侧角色列表面板
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useGameStore } from '../../../stores/useGameStore';
import { NpcCard } from './NpcCard';

export const NpcList = () => {
  const nearbyNpcs = useGameStore(state => state.nearbyNpcs);

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content}>
        {nearbyNpcs.map((npc, i) => (
          <NpcCard key={npc.id} npc={npc} />
        ))}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 7,
    backgroundColor: '#F5F0E830',
    borderWidth: 1,
    borderColor: '#8B7A5A30',
  },
  content: {
    padding: 8,
    gap: 6,
  },
});
