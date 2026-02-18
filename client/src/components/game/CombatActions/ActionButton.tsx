/**
 * ActionButton — 单个战斗招式按钮
 * 显示招式名 + 资源消耗，不可用时灰显
 * 冷却中显示剩余回合数覆盖层
 * 内功招式使用特殊配色
 */

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import type { CombatActionOption } from '@packages/core';

/** 资源类型 → 中文缩写 */
const RESOURCE_LABEL: Record<string, string> = {
  mp: '内',
  energy: '气',
  hp: '血',
};

interface ActionButtonProps {
  action: CombatActionOption;
  onPress: () => void;
  disabled?: boolean;
}

export const ActionButton = ({
  action,
  onPress,
  disabled,
}: ActionButtonProps) => {
  const isCooling = action.cooldownRemaining > 0;
  const isDisabled = disabled || !action.canUse || isCooling;

  /** 生成资源消耗摘要文本，如 "内30 气10" */
  const costText = action.costs
    .map(c => `${RESOURCE_LABEL[c.resource] || c.resource}${c.amount}`)
    .join(' ');

  return (
    <TouchableOpacity
      style={[
        s.button,
        action.isInternal && s.internalBorder,
        isDisabled && s.disabled,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={isDisabled}
    >
      <Text
        style={[s.name, action.isInternal && s.internalName]}
        numberOfLines={1}
      >
        {action.actionName}
      </Text>
      {costText ? (
        <Text style={s.cost} numberOfLines={1}>
          {costText}
        </Text>
      ) : null}

      {/* 冷却覆盖层 */}
      {isCooling ? (
        <View style={s.cooldownOverlay}>
          <Text style={s.cooldownText}>{action.cooldownRemaining}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

/** "更多" 按钮 — 用于展开全部招式 */
interface MoreButtonProps {
  onPress: () => void;
}

export const MoreButton = ({ onPress }: MoreButtonProps) => (
  <TouchableOpacity
    style={[s.button, s.moreBtn]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={s.moreName}>更多</Text>
    <Text style={s.moreIcon}>...</Text>
  </TouchableOpacity>
);

const s = StyleSheet.create({
  button: {
    flex: 1,
    minWidth: 56,
    maxWidth: 80,
    paddingVertical: 6,
    paddingHorizontal: 4,
    backgroundColor: 'rgba(245, 240, 232, 0.95)',
    borderWidth: 1,
    borderColor: '#8B7A5A60',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  /** 内功招式边框特殊配色 */
  internalBorder: {
    borderColor: '#6B5A3A90',
    backgroundColor: 'rgba(235, 228, 218, 0.95)',
  },
  disabled: {
    opacity: 0.4,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    textAlign: 'center',
  },
  /** 内功招式文字特殊配色 */
  internalName: {
    color: '#6B5A3A',
  },
  cost: {
    fontSize: 9,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
    textAlign: 'center',
  },
  /** 冷却覆盖层 */
  cooldownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(58, 53, 48, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cooldownText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F5F0E8',
    fontFamily: 'Noto Sans SC',
  },
  moreBtn: {
    backgroundColor: 'rgba(235, 228, 218, 0.8)',
    borderColor: '#8B7A5A40',
  },
  moreName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  moreIcon: {
    fontSize: 10,
    color: '#8B7A5A',
    letterSpacing: 1,
  },
});
