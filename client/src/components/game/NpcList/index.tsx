/**
 * NPC 列表 — 右侧角色列表面板（含 NPC 卡片 + 地面物品卡片）
 */

import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../../../stores/useGameStore';
import { NpcCard } from './NpcCard';
import { NpcInfoModal } from './NpcInfoModal';
import { ItemCard } from './ItemCard';
import { ItemInfoModal } from './ItemInfoModal';

export const NpcList = () => {
  const nearbyNpcs = useGameStore(state => state.nearbyNpcs);
  const npcDetail = useGameStore(state => state.npcDetail);
  const inventory = useGameStore(state => state.inventory);
  const setNpcDetail = useGameStore(state => state.setNpcDetail);
  const groundItems = useGameStore(state => state.groundItems);
  const itemDetail = useGameStore(state => state.itemDetail);
  const setItemDetail = useGameStore(state => state.setItemDetail);
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
        {groundItems.length > 0 ? (
          <View>
            <Text style={s.sectionLabel}>地面物品</Text>
            {groundItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onPress={() => sendCommand(`look ${item.name}`)}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
      <NpcInfoModal
        detail={npcDetail}
        inventory={inventory}
        onClose={() => setNpcDetail(null)}
        onChat={name => {
          sendCommand(`ask ${name} default`);
          setNpcDetail(null);
        }}
        onAttack={name => {
          sendCommand(`kill ${name}`);
        }}
        onGive={(itemName, npcName) => {
          sendCommand(`give ${itemName} to ${npcName}`);
        }}
      />
      <ItemInfoModal
        detail={itemDetail}
        onClose={() => setItemDetail(null)}
        onGet={name => {
          sendCommand(`get ${name}`);
        }}
        onGetFrom={(itemName, containerName) => {
          sendCommand(`get ${itemName} from ${containerName}`);
        }}
        onExamine={name => {
          sendCommand(`examine ${name}`);
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
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    marginTop: 4,
    marginBottom: 2,
  },
});
