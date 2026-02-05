/**
 * EquipmentView -- 装备槽位展示
 * 10 个装备槽位列表，当前全显示占位（equipment store 尚未添加）
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/** 装备槽位定义：英文 key → 中文名 */
const EQUIPMENT_SLOTS: { key: string; label: string }[] = [
  { key: 'head', label: '头部' },
  { key: 'neck', label: '颈部' },
  { key: 'body', label: '躯干' },
  { key: 'hands', label: '手部' },
  { key: 'waist', label: '腰部' },
  { key: 'feet', label: '足部' },
  { key: 'weapon', label: '武器' },
  { key: 'offhand', label: '副手' },
  { key: 'finger', label: '戒指' },
  { key: 'wrist', label: '护腕' },
];

export const EquipmentView = () => {
  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerText}>装备栏</Text>
      </View>
      {EQUIPMENT_SLOTS.map(slot => (
        <View key={slot.key} style={s.slotRow}>
          <Text style={s.slotLabel}>{slot.label}</Text>
          <Text style={s.slotValue}>--</Text>
        </View>
      ))}
      <Text style={s.hint}>装备系统开发中...</Text>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  header: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#8B7A5A20',
    marginBottom: 4,
  },
  headerText: {
    fontSize: 13,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    fontWeight: '600',
  },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#8B7A5A10',
  },
  slotLabel: {
    fontSize: 12,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    fontWeight: '500',
  },
  slotValue: {
    fontSize: 12,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  hint: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 11,
    color: '#8B7A5A80',
    fontFamily: 'Noto Serif SC',
    fontStyle: 'italic',
  },
});
