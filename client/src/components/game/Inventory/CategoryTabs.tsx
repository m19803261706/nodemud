/**
 * CategoryTabs -- 背包分类 Tab 栏
 * 6 个分类：装备/全部/武器/防具/药品/杂物
 * 水墨风样式，横向排列，选中态深色背景 + 浅色文字
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

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
  counts?: Partial<Record<CategoryKey, number>>;
}

export const CategoryTabs = ({
  activeCategory,
  onSelect,
  counts,
}: CategoryTabsProps) => {
  return (
    <View style={s.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {CATEGORIES.map(cat => {
          const isActive = cat.key === activeCategory;
          const count = counts?.[cat.key];
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
              {typeof count === 'number' ? (
                <View
                  style={[s.countBadge, isActive ? s.countBadgeActive : null]}
                >
                  <Text
                    style={[s.countText, isActive ? s.countTextActive : null]}
                  >
                    {count}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#8B7A5A20',
  },
  scrollContent: {
    paddingHorizontal: 8,
    gap: 6,
  },
  tab: {
    minWidth: 62,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
    backgroundColor: '#F5F0E850',
    borderWidth: 1,
    borderColor: '#8B7A5A30',
  },
  tabActive: {
    backgroundColor: '#3A3530',
    borderColor: '#3A3530',
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
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8B7A5A20',
  },
  countBadgeActive: {
    backgroundColor: '#F5F0E833',
  },
  countText: {
    fontSize: 10,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
    fontWeight: '600',
  },
  countTextActive: {
    color: '#F5F0E8',
  },
});
