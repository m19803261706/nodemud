/**
 * InventoryPage -- 全屏背包页面
 * 上下布局：物品区域(flex:3) + LogScrollView(flex:2)
 * 包含分类/搜索/排序、物品列表/装备视图、物品操作弹窗
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import type { InventoryItem } from '@packages/core';
import { useGameStore } from '../../../stores/useGameStore';
import { LogScrollView } from '../shared/LogScrollView';
import { CategoryTabs, type CategoryKey } from './CategoryTabs';
import { ItemList } from './ItemList';
import { EquipmentView } from './EquipmentView';
import { ItemActionSheet } from './ItemActionSheet';
import { InventoryToolbar, type InventorySortKey } from './InventoryToolbar';

/** 分类过滤规则 */
function filterByCategory(
  items: InventoryItem[],
  category: CategoryKey,
): InventoryItem[] {
  switch (category) {
    case 'all':
      return items;
    case 'weapon':
      return items.filter(it => it.type === 'weapon');
    case 'armor':
      return items.filter(it => it.type === 'armor');
    case 'medicine':
      return items.filter(it => it.type === 'medicine' || it.type === 'food');
    case 'misc':
      return items.filter(
        it =>
          it.type !== 'weapon' &&
          it.type !== 'armor' &&
          it.type !== 'medicine' &&
          it.type !== 'food',
      );
    default:
      return items;
  }
}

function sortItems(
  items: InventoryItem[],
  sortKey: InventorySortKey,
): InventoryItem[] {
  const cloned = [...items];
  switch (sortKey) {
    case 'name':
      return cloned.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'));
    case 'weight':
      return cloned.sort((a, b) => b.weight - a.weight);
    case 'value':
      return cloned.sort((a, b) => b.value - a.value);
    default:
      return cloned;
  }
}

export const InventoryPage = () => {
  const inventory = useGameStore(state => state.inventory);
  const equipment = useGameStore(state => state.equipment);

  /** 当前选中分类 */
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');
  const [keyword, setKeyword] = useState('');
  const [sortKey, setSortKey] = useState<InventorySortKey>('default');

  /** 选中的物品（弹窗用） */
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  /** 分类计数（按可见件数统计） */
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryKey, number> = {
      equipment: 0,
      all: 0,
      weapon: 0,
      armor: 0,
      medicine: 0,
      misc: 0,
    };

    for (const item of inventory) {
      counts.all += item.count;
      if (item.type === 'weapon') counts.weapon += item.count;
      else if (item.type === 'armor') counts.armor += item.count;
      else if (item.type === 'medicine' || item.type === 'food')
        counts.medicine += item.count;
      else counts.misc += item.count;
    }

    counts.equipment = Object.values(equipment).filter(Boolean).length;
    return counts;
  }, [inventory, equipment]);

  /** 过滤 + 关键词 + 排序后的物品列表 */
  const filteredItems = useMemo(() => {
    let result = filterByCategory(inventory, activeCategory);

    const normalizedKeyword = keyword.trim().toLowerCase();
    if (normalizedKeyword.length > 0) {
      result = result.filter(item => {
        return (
          item.name.toLowerCase().includes(normalizedKeyword) ||
          item.short.toLowerCase().includes(normalizedKeyword) ||
          item.type.toLowerCase().includes(normalizedKeyword)
        );
      });
    }

    return sortItems(result, sortKey);
  }, [inventory, activeCategory, keyword, sortKey]);

  const totalCount = useMemo(
    () => inventory.reduce((sum, item) => sum + item.count, 0),
    [inventory],
  );

  const totalWeight = useMemo(
    () => inventory.reduce((sum, item) => sum + item.weight * item.count, 0),
    [inventory],
  );

  const visibleCount = useMemo(
    () => filteredItems.reduce((sum, item) => sum + item.count, 0),
    [filteredItems],
  );

  /** 点击物品行 */
  const handleItemPress = useCallback((item: InventoryItem) => {
    setSelectedItem(item);
  }, []);

  /** 关闭弹窗 */
  const handleCloseSheet = useCallback(() => {
    setSelectedItem(null);
  }, []);

  /** 是否显示装备视图 */
  const isEquipmentTab = activeCategory === 'equipment';

  return (
    <View style={s.container}>
      {/* 上半部分：物品区域 */}
      <View style={s.inventoryArea}>
        <CategoryTabs
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          counts={categoryCounts}
        />
        {isEquipmentTab ? (
          <EquipmentView />
        ) : (
          <>
            <InventoryToolbar
              keyword={keyword}
              onKeywordChange={setKeyword}
              sortKey={sortKey}
              onSortChange={setSortKey}
              visibleCount={visibleCount}
              totalCount={totalCount}
              totalWeight={totalWeight}
            />
            <ItemList
              items={filteredItems}
              onItemPress={handleItemPress}
              emptyText={
                keyword.trim().length > 0
                  ? '没有匹配到符合条件的物品'
                  : '背包空空如也'
              }
            />
          </>
        )}
      </View>

      {/* 下半部分：日志 */}
      <View style={s.logArea}>
        <LogScrollView />
      </View>

      {/* 物品操作弹窗 */}
      <ItemActionSheet item={selectedItem} onClose={handleCloseSheet} />
    </View>
  );
};

/** 保持向后兼容的导出（GameHomeScreen 可能使用旧名称） */
export const Inventory = InventoryPage;

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  inventoryArea: {
    flex: 3,
    backgroundColor: '#F5F0E830',
    borderWidth: 1,
    borderColor: '#8B7A5A30',
  },
  logArea: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#8B7A5A30',
    borderTopWidth: 0,
    backgroundColor: '#F5F0E820',
  },
});
