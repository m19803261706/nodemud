/**
 * 游戏日志 — 日志列表 + 动作按钮栏
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useGameStore } from '../../../stores/useGameStore';
import { LogEntry } from './LogEntry';
import { ActionButton } from './ActionButton';

const ACTION_BUTTONS = ['拜师', '领取任务', '打坐'];

export const GameLog = () => {
  const gameLog = useGameStore(state => state.gameLog);

  return (
    <View style={s.container}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        {gameLog.map((line, i) => (
          <LogEntry key={i} text={line.text} color={line.color} />
        ))}
      </ScrollView>
      <View style={s.actionBar}>
        {ACTION_BUTTONS.map(label => (
          <ActionButton key={label} label={label} />
        ))}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E830',
    borderWidth: 1,
    borderColor: '#8B7A5A30',
    padding: 12,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 6,
  },
  actionBar: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
});
