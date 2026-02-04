/**
 * NPC 列表 — 右侧角色列表面板
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useGameStore } from '../../../stores/useGameStore';
import { NpcCard } from './NpcCard';
import { NpcInfoModal } from './NpcInfoModal';

export const NpcList = () => {
  const nearbyNpcs = useGameStore(state => state.nearbyNpcs);
  const npcDetail = useGameStore(state => state.npcDetail);
  const setNpcDetail = useGameStore(state => state.setNpcDetail);
  const sendCommand = useGameStore(state => state.sendCommand);

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content}>
        {nearbyNpcs.map(npc => (
          <NpcCard
            key={npc.id}
            npc={npc}
            onPress={() => sendCommand(`look ${npc.name}`)}
          />
        ))}
      </ScrollView>
      <NpcInfoModal
        detail={npcDetail}
        onClose={() => setNpcDetail(null)}
        onChat={name => {
          sendCommand(`ask ${name} default`);
          setNpcDetail(null);
        }}
      />
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
