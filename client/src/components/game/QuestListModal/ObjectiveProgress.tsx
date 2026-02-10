/**
 * 单个目标进度行 — 描述 + 当前/需求 + 完成勾选标记
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { QuestObjectiveProgress } from '@packages/core';

interface ObjectiveProgressProps {
  objective: QuestObjectiveProgress;
}

export const ObjectiveProgress = ({ objective }: ObjectiveProgressProps) => {
  const done = objective.completed;

  return (
    <View style={s.row}>
      {/* 勾选标记 */}
      <View style={[s.checkBox, done ? s.checkBoxDone : undefined]}>
        {done ? <Text style={s.checkMark}>&#10003;</Text> : null}
      </View>

      {/* 描述 */}
      <Text style={[s.desc, done ? s.descDone : undefined]} numberOfLines={1}>
        {objective.description}
      </Text>

      {/* 进度数值 */}
      <Text style={[s.count, done ? s.countDone : undefined]}>
        {objective.current}/{objective.required}
      </Text>
    </View>
  );
};

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    gap: 6,
  },
  checkBox: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: '#8B7A5A60',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBoxDone: {
    backgroundColor: '#8B7A5A20',
    borderColor: '#8B7A5A80',
  },
  checkMark: {
    fontSize: 10,
    color: '#5A8A6A',
    lineHeight: 12,
  },
  desc: {
    flex: 1,
    fontSize: 12,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  descDone: {
    color: '#A09888',
    textDecorationLine: 'line-through',
  },
  count: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
  },
  countDone: {
    color: '#A09888',
  },
});
