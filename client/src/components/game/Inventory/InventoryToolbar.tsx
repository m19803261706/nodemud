/**
 * InventoryToolbar -- 背包操作栏
 * 提供搜索、排序和实时统计信息
 */

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export type InventorySortKey = 'default' | 'name' | 'weight' | 'value';

interface SortOption {
  key: InventorySortKey;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { key: 'default', label: '默认' },
  { key: 'name', label: '名称' },
  { key: 'weight', label: '重量' },
  { key: 'value', label: '价值' },
];

interface InventoryToolbarProps {
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  sortKey: InventorySortKey;
  onSortChange: (key: InventorySortKey) => void;
  visibleCount: number;
  totalCount: number;
  totalWeight: number;
}

export const InventoryToolbar = ({
  keyword,
  onKeywordChange,
  sortKey,
  onSortChange,
  visibleCount,
  totalCount,
  totalWeight,
}: InventoryToolbarProps) => {
  return (
    <View style={s.container}>
      <View style={s.searchRow}>
        <TextInput
          value={keyword}
          onChangeText={onKeywordChange}
          placeholder="搜索物品名称或描述"
          placeholderTextColor="#A79C8C"
          style={s.searchInput}
          returnKeyType="search"
        />
        {keyword.length > 0 ? (
          <TouchableOpacity
            style={s.clearBtn}
            onPress={() => onKeywordChange('')}
            activeOpacity={0.7}
          >
            <Text style={s.clearText}>清空</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={s.sortRow}>
        {SORT_OPTIONS.map(option => {
          const active = option.key === sortKey;
          return (
            <TouchableOpacity
              key={option.key}
              style={[s.sortBtn, active ? s.sortBtnActive : null]}
              onPress={() => onSortChange(option.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[s.sortBtnText, active ? s.sortBtnTextActive : null]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={s.summary}>
        显示 {visibleCount}/{totalCount} 件物品 | 总重 {totalWeight}
      </Text>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#8B7A5A20',
    gap: 6,
    backgroundColor: '#F5F0E845',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 32,
    borderWidth: 1,
    borderColor: '#8B7A5A40',
    borderRadius: 3,
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    backgroundColor: '#FFFFFF80',
  },
  clearBtn: {
    height: 32,
    minWidth: 48,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B7A5A50',
    borderRadius: 3,
    backgroundColor: '#F5F0E8',
  },
  clearText: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    fontWeight: '500',
  },
  sortRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sortBtn: {
    paddingHorizontal: 10,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B7A5A40',
    borderRadius: 2,
    backgroundColor: '#F5F0E8',
  },
  sortBtnActive: {
    backgroundColor: '#3A3530',
    borderColor: '#3A3530',
  },
  sortBtnText: {
    fontSize: 11,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  sortBtnTextActive: {
    color: '#F5F0E8',
    fontWeight: '600',
  },
  summary: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
  },
});
