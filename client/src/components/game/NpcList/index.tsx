/**
 * NPC 列表 — 右侧角色列表面板（含 NPC 卡片 + 地面物品卡片）
 */

import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { MessageFactory } from '@packages/core';
import { useGameStore } from '../../../stores/useGameStore';
import { wsService } from '../../../services/WebSocketService';
import { NpcCard } from './NpcCard';
import { NpcInfoModal } from './NpcInfoModal';
import { ItemCard } from './ItemCard';
import { ShopListModal } from './ShopListModal';

export const NpcList = () => {
  const nearbyNpcs = useGameStore(state => state.nearbyNpcs);
  const npcDetail = useGameStore(state => state.npcDetail);
  const shopListDetail = useGameStore(state => state.shopListDetail);
  const inventory = useGameStore(state => state.inventory);
  const setNpcDetail = useGameStore(state => state.setNpcDetail);
  const setShopListDetail = useGameStore(state => state.setShopListDetail);
  const groundItems = useGameStore(state => state.groundItems);
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
        onShop={name => {
          sendCommand(`list ${name}`);
          setNpcDetail(null);
        }}
        onSell={(itemName, npcName) => {
          sendCommand(`sell ${itemName} to ${npcName}`);
        }}
        onAttack={name => {
          sendCommand(`kill ${name}`);
        }}
        onGive={(itemName, npcName) => {
          sendCommand(`give ${itemName} to ${npcName}`);
        }}
        onQuestAccept={(questId, npcId) => {
          wsService.send(
            MessageFactory.create('questAccept', { questId, npcId }),
          );
          setNpcDetail(null);
        }}
        onQuestComplete={(questId, npcId) => {
          wsService.send(
            MessageFactory.create('questComplete', { questId, npcId }),
          );
          setNpcDetail(null);
        }}
      />
      <ShopListModal
        detail={shopListDetail}
        onClose={() => setShopListDetail(null)}
        onBuy={(selector, merchantName) => {
          sendCommand(`buy ${selector} from ${merchantName}`);
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
