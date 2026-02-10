/**
 * ItemList -- 背包物品列表
 * FlatList 虚拟化渲染 + 空状态提示
 */

import React, { useCallback } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import type { InventoryItem } from '@packages/core';
import { ItemRow } from './ItemRow';

interface ItemListProps {
  items: InventoryItem[];
  onItemPress: (item: InventoryItem) => void;
  emptyText?: string;
}

export const ItemList = ({ items, onItemPress, emptyText }: ItemListProps) => {
  /** 渲染单行 */
  const renderItem = useCallback(
    ({ item }: { item: InventoryItem }) => (
      <ItemRow item={item} onPress={onItemPress} />
    ),
    [onItemPress],
  );

  /** key 提取 */
  const keyExtractor = useCallback((item: InventoryItem) => item.id, []);

  /** 空状态 */
  const ListEmpty = useCallback(
    () => (
      <View style={s.emptyWrap}>
        <Text style={s.empty}>{emptyText ?? '背包空空如也'}</Text>
        <Text style={s.emptyHint}>切换分类或调整关键词试试</Text>
      </View>
    ),
    [emptyText],
  );

  return (
    <View style={s.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={ListEmpty}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 34,
    gap: 4,
  },
  empty: {
    fontSize: 13,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    fontStyle: 'italic',
  },
  emptyHint: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
  },
});
