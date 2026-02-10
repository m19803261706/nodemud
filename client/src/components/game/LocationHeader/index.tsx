/**
 * 地点标题栏 — 地点名 + 操作按钮 + 渐变分隔线
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useGameStore } from '../../../stores/useGameStore';
import { GradientDivider } from '../shared';
import { LocationTitle } from './LocationTitle';
import { LocationActionButton } from './LocationActionButton';
import { DescToggleButton } from './DescToggleButton';

export const LocationHeader = () => {
  const location = useGameStore(state => state.location);
  const showMapDesc = useGameStore(state => state.showMapDesc);
  const toggleMapDesc = useGameStore(state => state.toggleMapDesc);
  const setQuestModalVisible = useGameStore(
    state => state.setQuestModalVisible,
  );

  /** 处理操作按钮点击 */
  const handleActionPress = (label: string) => {
    if (label === '任务') {
      setQuestModalVisible(true);
    }
  };

  /** 将 actions 中的"邮件"替换为"任务" */
  const actions = location.actions.map(a => (a === '邮件' ? '任务' : a));

  return (
    <View style={s.container}>
      <View style={s.row}>
        <LocationTitle name={location.name} />
        <View style={s.btns}>
          {actions.map(label => (
            <LocationActionButton
              key={label}
              label={label}
              onPress={() => handleActionPress(label)}
            />
          ))}
          <DescToggleButton active={showMapDesc} onPress={toggleMapDesc} />
        </View>
      </View>
      <GradientDivider opacity={0.25} />
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btns: {
    flexDirection: 'row',
    gap: 6,
  },
});
