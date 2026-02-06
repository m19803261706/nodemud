/**
 * 地面物品卡片 — 水墨风物品展示
 * 普通物品：物品名 + 类型标签
 * 残骸：物品名 + 内容物数量角标，特殊底色
 */

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import type { ItemBrief } from '@packages/core';

/** 物品类型 → 中文标签 */
const TYPE_LABEL: Record<string, string> = {
  weapon: '武器',
  armor: '防具',
  medicine: '药品',
  book: '秘籍',
  container: '容器',
  food: '食物',
  key: '钥匙',
  misc: '杂物',
  remains: '残骸',
};

interface ItemCardProps {
  item: ItemBrief;
  onPress?: () => void;
}

export const ItemCard = ({ item, onPress }: ItemCardProps) => {
  const isRemains = item.isRemains;
  const bgColor = isRemains ? '#E0D8CB' : '#EDE8DD';
  const borderColor = isRemains ? '#8B7A5A60' : '#8B7A5A30';
  const typeLabel = TYPE_LABEL[item.type] || item.type;

  return (
    <TouchableOpacity
      style={[s.card, { backgroundColor: bgColor, borderColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={s.top}>
        <Text style={s.name} numberOfLines={1}>{item.name}</Text>
        {isRemains && item.contentCount !== undefined && item.contentCount > 0 ? (
          <View style={s.badge}>
            <Text style={s.badgeText}>{item.contentCount}</Text>
          </View>
        ) : null}
      </View>
      <Text style={s.type}>{typeLabel}</Text>
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  card: {
    padding: 6,
    gap: 2,
    borderWidth: 1,
    marginBottom: 6,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  badge: {
    backgroundColor: '#8B7A5A30',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    marginLeft: 4,
  },
  badgeText: {
    fontSize: 10,
    color: '#6B5D4D',
    fontFamily: 'Noto Sans SC',
    fontWeight: '600',
  },
  type: {
    fontSize: 10,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
});
