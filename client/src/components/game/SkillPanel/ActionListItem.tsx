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
        <View style={s.headerRight}>
          <Text style={[s.lvlReq, locked ? s.textLocked : undefined]}>
            Lv.{action.lvl}
          </Text>
          <Text
            style={[
              s.stateBadge,
              locked ? s.stateBadgeLocked : s.stateBadgeUnlocked,
            ]}
          >
            {locked ? '未悟' : '已悟'}
          </Text>
        </View>
      </View>

      {/* 描述 */}
      {action.description ? (
        <Text
          style={[s.desc, locked ? s.textLocked : undefined]}
          numberOfLines={3}
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
              <View key={item.key} style={s.modChip}>
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
            <View key={cost.resource} style={s.costChip}>
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
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D4C9B8',
    gap: 5,
  },
  containerLocked: {
    opacity: 0.4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    flex: 1,
  },
  textLocked: {
    color: '#A09888',
  },
  lvlReq: {
    fontSize: 10,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
  },
  stateBadge: {
    fontSize: 9,
    fontFamily: 'Noto Serif SC',
    fontWeight: '600',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 2,
    overflow: 'hidden',
  },
  stateBadgeUnlocked: {
    color: '#3F6A4D',
    backgroundColor: '#3F6A4D20',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#3F6A4D66',
  },
  stateBadgeLocked: {
    color: '#8B7A5A',
    backgroundColor: '#8B7A5A16',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#8B7A5A55',
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
    gap: 6,
    marginTop: 2,
  },
  modChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#8B7A5A40',
    backgroundColor: '#F5F0E870',
  },
  costChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#B08A6A55',
    backgroundColor: '#B08A6A14',
  },
  modLabel: {
    fontSize: 9,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  modValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B5D4D',
    fontFamily: 'Noto Sans SC',
  },
  costLabel: {
    fontSize: 9,
    color: '#A09888',
    fontFamily: 'Noto Serif SC',
  },
  costValue: {
    fontSize: 10,
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
