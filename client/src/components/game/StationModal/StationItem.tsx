/**
 * StationItem -- 驿站列表中的单个城镇条目
 * 已探索：可点击传送；未探索：灰色锁定；当前位置：标记不可点
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { StationInfo } from '../../../stores/useGameStore';

interface StationItemProps {
  station: StationInfo;
  onPress: (station: StationInfo) => void;
}

export const StationItem = ({ station, onPress }: StationItemProps) => {
  const disabled = !station.isExplored || station.isCurrent;

  return (
    <TouchableOpacity
      style={[s.container, disabled && s.containerDisabled]}
      activeOpacity={disabled ? 1 : 0.6}
      onPress={() => {
        if (!disabled) onPress(station);
      }}
    >
      <View style={s.info}>
        {/* 城镇名称 */}
        <View style={s.nameRow}>
          <Text
            style={[s.name, !station.isExplored && s.nameDisabled]}
            numberOfLines={1}
          >
            {station.name}
          </Text>
          {station.isCurrent && (
            <View style={s.currentBadge}>
              <Text style={s.currentBadgeText}>当前</Text>
            </View>
          )}
          {!station.isExplored && (
            <View style={s.lockedBadge}>
              <Text style={s.lockedBadgeText}>未探索</Text>
            </View>
          )}
        </View>

        {/* 区域 + 等级范围 */}
        <Text style={[s.sub, !station.isExplored && s.subDisabled]}>
          {station.region}
          {'  '}
          Lv.{station.levelRange.min}-{station.levelRange.max}
        </Text>

        {/* 描述 */}
        {station.isExplored && (
          <Text style={s.desc} numberOfLines={2}>
            {station.description}
          </Text>
        )}
      </View>

      {/* 传送按钮（仅已探索且非当前位置） */}
      {station.isExplored && !station.isCurrent && (
        <View style={s.actionArea}>
          <Text style={s.actionText}>传送</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D5CEC0',
  },
  containerDisabled: {
    opacity: 0.6,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  nameDisabled: {
    color: '#B0A090',
  },
  currentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#2B5B3C',
    borderRadius: 2,
  },
  currentBadgeText: {
    fontSize: 10,
    color: '#2B5B3C',
    fontFamily: 'Noto Serif SC',
  },
  lockedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#B0A090',
    borderRadius: 2,
  },
  lockedBadgeText: {
    fontSize: 10,
    color: '#B0A090',
    fontFamily: 'Noto Serif SC',
  },
  sub: {
    fontSize: 12,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  subDisabled: {
    color: '#B0A090',
  },
  desc: {
    fontSize: 11,
    color: '#8B7A5A',
    lineHeight: 16,
    marginTop: 2,
  },
  actionArea: {
    marginLeft: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#2E6B8A',
  },
  actionText: {
    fontSize: 12,
    color: '#2E6B8A',
    fontWeight: '600',
    fontFamily: 'Noto Serif SC',
  },
});
