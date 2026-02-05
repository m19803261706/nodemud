/**
 * 背包面板 — 右侧面板，展示玩家背包物品列表
 */

import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../../../stores/useGameStore';
import { InventoryItemRow } from './InventoryItemRow';

export const Inventory = () => {
  const inventory = useGameStore(state => state.inventory);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>背包</Text>
        <Text style={s.count}>{inventory.length}件</Text>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        {inventory.length === 0 ? (
          <Text style={s.empty}>背包空空如也</Text>
        ) : (
          inventory.map(item => (
            <InventoryItemRow key={item.id} item={item} />
          ))
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#8B7A5A20',
  },
  title: {
    fontSize: 12,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    fontWeight: '600',
  },
  count: {
    fontSize: 10,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
  },
  content: {
    padding: 4,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 12,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
});
