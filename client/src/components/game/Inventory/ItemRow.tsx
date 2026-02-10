/**
 * ItemRow -- 背包物品行
 * 显示物品名称、描述、类型、重量、价值、数量
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
      <View style={s.main}>
        <View style={s.nameRow}>
          <Text style={s.name} numberOfLines={1}>
            {item.name}
          </Text>
          {item.count > 1 ? (
            <Text style={s.countBadge}>x{item.count}</Text>
          ) : null}
        </View>
        <Text style={s.short} numberOfLines={1}>
          {item.short}
        </Text>
      </View>

      <View style={s.meta}>
        <View style={s.typeBadge}>
          <Text style={s.typeText}>{typeLabel}</Text>
        </View>
        <Text style={s.metaText}>{item.weight}重</Text>
        <Text style={s.metaText}>{item.value}银</Text>
      </View>
    </TouchableOpacity>
  );
});

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#8B7A5A15',
    gap: 8,
  },
  main: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    flex: 1,
    fontSize: 14,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    fontWeight: '600',
  },
  short: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  countBadge: {
    fontSize: 10,
    color: '#5B503F',
    fontFamily: 'Noto Sans SC',
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 1,
    backgroundColor: '#8B7A5A20',
    borderRadius: 8,
  },
  meta: {
    alignItems: 'flex-end',
    gap: 3,
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
  metaText: {
    fontSize: 10,
    color: '#6B5D4D',
    fontFamily: 'Noto Sans SC',
  },
});
