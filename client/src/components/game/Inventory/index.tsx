/**
 * InventoryPage -- 全屏背包页面
 * 上下布局：物品区域(flex:3) + LogScrollView(flex:2)
 * 包含分类 Tab 切换、物品列表/装备视图、物品操作弹窗
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

export const InventoryPage = () => {
  const inventory = useGameStore(state => state.inventory);

  /** 当前选中分类 */
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');

  /** 选中的物品（弹窗用） */
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  /** 过滤后的物品列表 */
  const filteredItems = useMemo(
    () => filterByCategory(inventory, activeCategory),
    [inventory, activeCategory],
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
        />
        {isEquipmentTab ? (
          <EquipmentView />
        ) : (
          <ItemList items={filteredItems} onItemPress={handleItemPress} />
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
