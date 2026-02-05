/**
 * 背包物品行 — 显示物品名称、类型标签、数量
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { InventoryItem } from '@packages/core';

/** 物品类型中文映射 */
const ItemTypeLabel: Record<string, string> = {
  weapon: '武器',
  armor: '防具',
  medicine: '药品',
  book: '秘籍',
  container: '容器',
  food: '食物',
  key: '钥匙',
  misc: '杂物',
};

interface Props {
  item: InventoryItem;
}

export const InventoryItemRow = ({ item }: Props) => {
  const typeLabel = ItemTypeLabel[item.type] || item.type;

  return (
    <View style={s.row}>
      <Text style={s.name} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={s.type}>{typeLabel}</Text>
      {item.count > 1 && <Text style={s.count}>x{item.count}</Text>}
    </View>
  );
};

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#8B7A5A15',
    gap: 6,
  },
  name: {
    flex: 1,
    fontSize: 12,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    fontWeight: '500',
  },
  type: {
    fontSize: 10,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
  },
  count: {
    fontSize: 10,
    color: '#6B5D4D',
    fontFamily: 'Noto Sans SC',
    fontWeight: '600',
  },
});
