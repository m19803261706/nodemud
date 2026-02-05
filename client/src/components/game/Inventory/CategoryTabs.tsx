/**
 * CategoryTabs -- 背包分类 Tab 栏
 * 6 个分类：装备/全部/武器/防具/药品/杂物
 * 水墨风样式，横向排列，选中态深色背景 + 浅色文字
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/** 分类定义 */
export type CategoryKey =
  | 'equipment'
  | 'all'
  | 'weapon'
  | 'armor'
  | 'medicine'
  | 'misc';

interface CategoryDef {
  key: CategoryKey;
  label: string;
}

/** 分类列表（保持顺序） */
export const CATEGORIES: CategoryDef[] = [
  { key: 'equipment', label: '装备' },
  { key: 'all', label: '全部' },
  { key: 'weapon', label: '武器' },
  { key: 'armor', label: '防具' },
  { key: 'medicine', label: '药品' },
  { key: 'misc', label: '杂物' },
];

interface CategoryTabsProps {
  activeCategory: CategoryKey;
  onSelect: (category: CategoryKey) => void;
}

export const CategoryTabs = ({ activeCategory, onSelect }: CategoryTabsProps) => {
  return (
    <View style={s.container}>
      {CATEGORIES.map(cat => {
        const isActive = cat.key === activeCategory;
        return (
          <TouchableOpacity
            key={cat.key}
            style={[s.tab, isActive && s.tabActive]}
            onPress={() => onSelect(cat.key)}
            activeOpacity={0.7}
          >
            <Text style={[s.tabText, isActive && s.tabTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#8B7A5A20',
  },
  tab: {
    flex: 1,
    paddingVertical: 5,
    alignItems: 'center',
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: '#3A3530',
  },
  tabText: {
    fontSize: 12,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#F5F0E8',
    fontWeight: '600',
  },
});
