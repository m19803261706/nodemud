/**
 * ActionBar — 战斗招式快捷栏
 * 横向排列 ActionButton，超过 MAX_VISIBLE 个时末尾显示"更多"按钮
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { CombatActionOption } from '@packages/core';
import { ActionButton, MoreButton } from './ActionButton';

/** 快捷栏最多可见按钮数（不含"更多"） */
const MAX_VISIBLE = 5;

interface ActionBarProps {
  actions: CombatActionOption[];
  onActionPress: (action: CombatActionOption) => void;
  onMorePress: () => void;
  disabled?: boolean;
}

export const ActionBar = ({
  actions,
  onActionPress,
  onMorePress,
  disabled,
}: ActionBarProps) => {
  const needMore = actions.length > MAX_VISIBLE;
  const visibleActions = needMore ? actions.slice(0, MAX_VISIBLE) : actions;

  return (
    <View style={s.bar}>
      {visibleActions.map(action => (
        <ActionButton
          key={action.index}
          action={action}
          onPress={() => onActionPress(action)}
          disabled={disabled}
        />
      ))}
      {needMore ? <MoreButton onPress={onMorePress} /> : null}
    </View>
  );
};

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 4,
  },
});
