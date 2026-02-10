/**
 * SkillCategoryTabs -- 技能分类 Tab 栏
 * 4 个 Tab: 武学 / 内功 / 辅技 / 悟道
 * 对应 SkillCategory: martial / internal / support / cognize
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SkillCategory } from '@packages/core';

interface SkillCategoryTabsProps {
  activeTab: SkillCategory;
  onTabChange: (tab: SkillCategory) => void;
}

/** Tab 配置 */
const TABS: { key: SkillCategory; label: string }[] = [
  { key: SkillCategory.MARTIAL, label: '武学' },
  { key: SkillCategory.INTERNAL, label: '内功' },
  { key: SkillCategory.SUPPORT, label: '辅技' },
  { key: SkillCategory.COGNIZE, label: '悟道' },
];

export const SkillCategoryTabs = ({
  activeTab,
  onTabChange,
}: SkillCategoryTabsProps) => {
  return (
    <View style={s.container}>
      {TABS.map(tab => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[s.tab, isActive ? s.tabActive : undefined]}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[s.tabText, isActive ? s.tabTextActive : undefined]}>
              {tab.label}
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
    gap: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D4C9B8',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
  },
  tabActive: {
    backgroundColor: '#3A3530',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 1,
  },
  tabTextActive: {
    color: '#F5F0E8',
  },
});
