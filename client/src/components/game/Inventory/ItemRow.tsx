/**
 * ItemRow -- 背包物品行
 * 显示物品名称、类型标签、重量、数量
 * 支持点击选中（触发操作弹窗）
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { InventoryItem } from '@packages/core';

/** 物品类型中文映射 */
const ITEM_TYPE_LABEL: Record<string, string> = {
  weapon: '武器',
  armor: '防具',
  medicine: '药品',
  book: '秘籍',
  container: '容器',
  food: '食物',
  key: '钥匙',
  misc: '杂物',
};

interface ItemRowProps {
  item: InventoryItem;
  onPress: (item: InventoryItem) => void;
}

export const ItemRow = React.memo(({ item, onPress }: ItemRowProps) => {
  const typeLabel = ITEM_TYPE_LABEL[item.type] || item.type;

  return (
    <TouchableOpacity
      style={s.row}
      onPress={() => onPress(item)}
      activeOpacity={0.6}
    >
      {/* 物品名 + 数量 */}
      <Text style={s.name} numberOfLines={1}>
        {item.name}
        {item.count > 1 ? ` x${item.count}` : ''}
      </Text>

      {/* 类型标签 */}
      <View style={s.typeBadge}>
        <Text style={s.typeText}>{typeLabel}</Text>
      </View>

      {/* 重量 */}
      <Text style={s.weight}>{item.weight}</Text>
    </TouchableOpacity>
  );
});

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#8B7A5A15',
    gap: 6,
  },
  name: {
    flex: 1,
    fontSize: 13,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    fontWeight: '500',
  },
  typeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    backgroundColor: '#8B7A5A15',
    borderRadius: 2,
  },
  typeText: {
    fontSize: 10,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
  },
  weight: {
    fontSize: 11,
    color: '#6B5D4D',
    fontFamily: 'Noto Sans SC',
    width: 28,
    textAlign: 'right',
  },
});
