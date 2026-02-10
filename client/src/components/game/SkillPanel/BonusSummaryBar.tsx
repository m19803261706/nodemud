/**
 * BonusSummaryBar -- 技能加成汇总栏
 * 紧凑展示攻击/防御/闪避/招架等加成值
 * 水墨风横条样式，位于技能面板顶部
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { SkillBonusSummary } from '@packages/core';

interface BonusSummaryBarProps {
  summary: SkillBonusSummary | null;
}

/** 加成项配置 */
const BONUS_ITEMS: { key: keyof SkillBonusSummary; label: string }[] = [
  { key: 'attack', label: '攻击' },
  { key: 'defense', label: '防御' },
  { key: 'dodge', label: '闪避' },
  { key: 'parry', label: '招架' },
];

export const BonusSummaryBar = ({ summary }: BonusSummaryBarProps) => {
  return (
    <View style={s.container}>
      {BONUS_ITEMS.map((item, idx) => {
        const value = summary ? summary[item.key] : 0;
        return (
          <React.Fragment key={item.key}>
            {idx > 0 ? <View style={s.dot} /> : null}
            <View style={s.item}>
              <Text style={s.label}>{item.label}</Text>
              <Text style={[s.value, value > 0 ? s.valuePositive : undefined]}>
                +{value}
              </Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E8E0D020',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#8B7A5A30',
    borderRadius: 2,
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  label: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A09888',
    fontFamily: 'Noto Sans SC',
  },
  valuePositive: {
    color: '#6B5D4D',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#8B7A5A30',
  },
});
