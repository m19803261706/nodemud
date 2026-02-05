/**
 * ItemList -- 背包物品列表
 * FlatList 虚拟化渲染，底部统计栏，空状态提示
 */

import React, { useCallback, useMemo } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import type { InventoryItem } from '@packages/core';
import { ItemRow } from './ItemRow';

interface ItemListProps {
  items: InventoryItem[];
  onItemPress: (item: InventoryItem) => void;
}

export const ItemList = ({ items, onItemPress }: ItemListProps) => {
  /** 底部统计：物品数 + 总重量 */
  const stats = useMemo(() => {
    const totalCount = items.reduce((sum, it) => sum + it.count, 0);
    const totalWeight = items.reduce((sum, it) => sum + it.weight * it.count, 0);
    return { totalCount, totalWeight };
  }, [items]);

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
    () => <Text style={s.empty}>背包空空如也</Text>,
    [],
  );

  /** 底部统计 */
  const ListFooter = useCallback(
    () =>
      items.length > 0 ? (
        <View style={s.footer}>
          <Text style={s.footerText}>
            共 {stats.totalCount} 件
          </Text>
          <Text style={s.footerText}>
            总重 {stats.totalWeight}
          </Text>
        </View>
      ) : null,
    [items.length, stats],
  );

  return (
    <View style={s.container}>
      {/* 列头 */}
      <View style={s.listHeader}>
        <Text style={s.colName}>名称</Text>
        <Text style={s.colType}>类型</Text>
        <Text style={s.colWeight}>重量</Text>
      </View>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
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
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#8B7A5A30',
    gap: 6,
  },
  colName: {
    flex: 1,
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
  },
  colType: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
    width: 36,
    textAlign: 'center',
  },
  colWeight: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
    width: 28,
    textAlign: 'right',
  },
  empty: {
    textAlign: 'center',
    paddingVertical: 30,
    fontSize: 13,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#8B7A5A20',
  },
  footerText: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
  },
});
