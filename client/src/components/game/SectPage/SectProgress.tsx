/**
 * SectProgress -- 门派日常/进度区域
 * 展示切磋次数、解密链进度、挑战达成状态
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { SectProgressData } from '@packages/core';

interface SectProgressProps {
  progress: SectProgressData;
}

/** 解密链状态中文映射 */
const PUZZLE_STATE_LABEL: Record<string, string> = {
  not_started: '未开始',
  in_progress: '进行中',
  completed: '已完成',
};

export const SectProgress = ({ progress }: SectProgressProps) => {
  const { daily, puzzle, challenges } = progress;

  return (
    <View style={s.container}>
      <Text style={s.sectionTitle}>门派日常</Text>

      {/* 切磋次数 */}
      <View style={s.card}>
        <View style={s.row}>
          <Text style={s.label}>今日切磋</Text>
          <Text style={s.value}>
            {daily.sparCount} / {daily.sparLimit}
          </Text>
        </View>
      </View>

      {/* 解密链进度 */}
      <View style={s.card}>
        <Text style={s.subTitle}>解密链</Text>
        <View style={s.row}>
          <Text style={s.label}>残卷收集</Text>
          <Text style={s.value}>{puzzle.canjuCollected} 篇</Text>
        </View>
        <View style={s.row}>
          <Text style={s.label}>残卷拼凑</Text>
          <StatusBadge state={puzzle.canjuState} />
        </View>
        <View style={s.row}>
          <Text style={s.label}>断句解读</Text>
          <StatusBadge state={puzzle.duanjuState} />
        </View>
        <View style={s.row}>
          <Text style={s.label}>实验验证</Text>
          <StatusBadge state={puzzle.shiyanState} />
        </View>
      </View>

      {/* 挑战达成 */}
      <View style={s.card}>
        <Text style={s.subTitle}>进阶挑战</Text>
        <View style={s.row}>
          <Text style={s.label}>击败首席弟子</Text>
          <CheckMark done={challenges.chiefDiscipleWin} />
        </View>
        <View style={s.row}>
          <Text style={s.label}>连胜纪录</Text>
          <CheckMark done={challenges.sparStreakWin} />
        </View>
        <View style={s.row}>
          <Text style={s.label}>师父认可</Text>
          <CheckMark done={challenges.masterApproval} />
        </View>
      </View>
    </View>
  );
};

/** 状态小标签 */
const StatusBadge = ({ state }: { state: string }) => {
  const label = PUZZLE_STATE_LABEL[state] ?? state;
  const isComplete = state === 'completed';
  return (
    <View style={[s.badge, isComplete ? s.badgeComplete : undefined]}>
      <Text style={[s.badgeText, isComplete ? s.badgeTextComplete : undefined]}>
        {label}
      </Text>
    </View>
  );
};

/** 勾选标记 */
const CheckMark = ({ done }: { done: boolean }) => (
  <Text style={done ? s.checkDone : s.checkPending}>
    {done ? '✓' : '—'}
  </Text>
);

const s = StyleSheet.create({
  container: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#F5F0E8',
    borderWidth: 1,
    borderColor: '#8B7A5A30',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  subTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  badge: {
    borderWidth: 1,
    borderColor: '#8B7A5A40',
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeComplete: {
    borderColor: '#2F7A3F40',
    backgroundColor: '#2F7A3F10',
  },
  badgeText: {
    fontSize: 10,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  badgeTextComplete: {
    color: '#2F7A3F',
    fontWeight: '600',
  },
  checkDone: {
    fontSize: 14,
    color: '#2F7A3F',
    fontWeight: '700',
  },
  checkPending: {
    fontSize: 14,
    color: '#D5D0C8',
  },
});
