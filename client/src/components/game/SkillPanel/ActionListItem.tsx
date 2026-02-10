/**
 * ActionListItem -- 招式列表项
 * 显示招式名 + 等级要求 + 修正值详情
 * 已解锁: 显示 modifiers 详情
 * 未解锁: 灰显 + "等级不足"
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ActionDetailInfo } from '@packages/core';

interface ActionListItemProps {
  action: ActionDetailInfo;
}

/** 修正值项目配置 */
const MODIFIER_ITEMS: {
  key: keyof ActionDetailInfo['modifiers'];
  label: string;
}[] = [
  { key: 'attack', label: '攻击' },
  { key: 'damage', label: '伤害' },
  { key: 'dodge', label: '闪避' },
  { key: 'parry', label: '招架' },
];

export const ActionListItem = ({ action }: ActionListItemProps) => {
  const locked = !action.unlocked;

  return (
    <View style={[s.container, locked ? s.containerLocked : undefined]}>
      {/* 头部: 招式名 + 等级要求 */}
      <View style={s.headerRow}>
        <Text style={[s.name, locked ? s.textLocked : undefined]}>
          {action.skillName}
        </Text>
        <Text style={[s.lvlReq, locked ? s.textLocked : undefined]}>
          Lv.{action.lvl}
        </Text>
      </View>

      {/* 描述 */}
      {action.description ? (
        <Text
          style={[s.desc, locked ? s.textLocked : undefined]}
          numberOfLines={2}
        >
          {action.description}
        </Text>
      ) : null}

      {/* 已解锁: 显示修正值 */}
      {!locked ? (
        <View style={s.modRow}>
          {MODIFIER_ITEMS.map(item => {
            const val =
              item.key === 'damageType'
                ? 0
                : (action.modifiers[item.key] as number);
            if (val === 0) return null;
            return (
              <View key={item.key} style={s.modItem}>
                <Text style={s.modLabel}>{item.label}</Text>
                <Text style={s.modValue}>
                  {val > 0 ? '+' : ''}
                  {val}
                </Text>
              </View>
            );
          })}
          {/* 资源消耗 */}
          {action.costs.map(cost => (
            <View key={cost.resource} style={s.modItem}>
              <Text style={s.costLabel}>{cost.resource}</Text>
              <Text style={s.costValue}>-{cost.amount}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={s.lockedHint}>等级不足</Text>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D4C9B8',
    gap: 4,
  },
  containerLocked: {
    opacity: 0.4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  textLocked: {
    color: '#A09888',
  },
  lvlReq: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
  },
  desc: {
    fontSize: 11,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    lineHeight: 17,
  },
  modRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  modItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  modLabel: {
    fontSize: 10,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  modValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B5D4D',
    fontFamily: 'Noto Sans SC',
  },
  costLabel: {
    fontSize: 10,
    color: '#A09888',
    fontFamily: 'Noto Serif SC',
  },
  costValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B08A6A',
    fontFamily: 'Noto Sans SC',
  },
  lockedHint: {
    fontSize: 10,
    color: '#A09888',
    fontFamily: 'Noto Serif SC',
    fontStyle: 'italic',
  },
});
