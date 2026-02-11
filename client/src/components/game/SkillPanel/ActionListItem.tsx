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
    <View style={[s.container, locked ? s.containerLocked : s.containerUnlocked]}>
      <View style={[s.sideBar, locked ? s.sideBarLocked : s.sideBarUnlocked]} />

      <View style={s.content}>
        {/* 头部: 招式名 + 等级要求 */}
        <View style={s.headerRow}>
          <View style={s.titleWrap}>
            <Text style={[s.name, locked ? s.nameLocked : undefined]} numberOfLines={1}>
              {action.skillName}
            </Text>
            <Text style={[s.subTitle, locked ? s.subTitleLocked : undefined]}>
              {locked ? `需境界 Lv.${action.lvl} 方可领会` : '已可运使'}
            </Text>
          </View>

          <View style={s.headerRight}>
            <Text style={[s.lvlReq, locked ? s.lvlReqLocked : undefined]}>
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
            style={[s.desc, locked ? s.descLocked : undefined]}
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
          <View style={s.lockInfo}>
            <Text style={s.lockedHint}>你当前境界不足，继续修习可解锁此式。</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
  containerUnlocked: {
    borderColor: '#7E6C523D',
    backgroundColor: '#F7F1E6',
  },
  containerLocked: {
    borderColor: '#A79C8C66',
    backgroundColor: '#ECE5DA',
  },
  sideBar: {
    width: 3,
  },
  sideBarUnlocked: {
    backgroundColor: '#7A5C34',
  },
  sideBarLocked: {
    backgroundColor: '#B4A796',
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 5,
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
  titleWrap: {
    flex: 1,
    gap: 1,
    paddingRight: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2F261A',
    fontFamily: 'Noto Serif SC',
  },
  nameLocked: {
    color: '#706556',
  },
  subTitle: {
    fontSize: 10,
    color: '#7A6B56',
    fontFamily: 'Noto Serif SC',
  },
  subTitleLocked: {
    color: '#9A8D7A',
  },
  lvlReq: {
    fontSize: 10,
    color: '#6E5B43',
    fontFamily: 'Noto Sans SC',
  },
  lvlReqLocked: {
    color: '#9A8D7A',
  },
  stateBadge: {
    fontSize: 9,
    fontFamily: 'Noto Serif SC',
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  stateBadgeUnlocked: {
    color: '#6E4D25',
    backgroundColor: '#8A6A4122',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#8A6A4170',
  },
  stateBadgeLocked: {
    color: '#8B7A5A',
    backgroundColor: '#8B7A5A16',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#8B7A5A55',
  },
  desc: {
    fontSize: 11,
    color: '#5A4A36',
    fontFamily: 'Noto Serif SC',
    lineHeight: 17,
  },
  descLocked: {
    color: '#857866',
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
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#7E6C525C',
    backgroundColor: '#FBF6EE',
  },
  costChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#8F644265',
    backgroundColor: '#F3E2D2',
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
    color: '#8F6442',
    fontFamily: 'Noto Sans SC',
  },
  lockInfo: {
    marginTop: 2,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#A79C8C55',
    backgroundColor: '#F1E9DE',
  },
  lockedHint: {
    fontSize: 10,
    color: '#857866',
    fontFamily: 'Noto Serif SC',
    lineHeight: 15,
  },
});
