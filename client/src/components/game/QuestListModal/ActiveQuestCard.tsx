/**
 * 进行中任务卡片 — 任务名 + 类型标签 + 目标进度 + 放弃按钮
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from '../../LinearGradient';
import { ObjectiveProgress } from './ObjectiveProgress';
import type { ActiveQuestInfo } from '../../../stores/useGameStore';

/** 任务类型 → 中文显示 */
const TYPE_LABELS: Record<string, string> = {
  deliver: '送信',
  capture: '剿灭',
  collect: '收集',
  dialogue: '打探',
};

/** 任务类型 → 角标颜色 */
const TYPE_COLORS: Record<string, string> = {
  deliver: '#4A7A8B',
  capture: '#8B4A4A',
  collect: '#5A8A5A',
  dialogue: '#7A6A4A',
};

interface ActiveQuestCardProps {
  quest: ActiveQuestInfo;
  onAbandon: (questId: string) => void;
}

export const ActiveQuestCard = ({ quest, onAbandon }: ActiveQuestCardProps) => {
  const typeLabel = TYPE_LABELS[quest.type] || quest.type;
  const typeColor = TYPE_COLORS[quest.type] || '#8B7A5A';
  const isReady = quest.status === 'ready';

  return (
    <View style={s.card}>
      {/* 卡片渐变背景 */}
      <LinearGradient
        colors={['#EBE5DA', '#E5DFD2', '#DDD7C8']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View style={s.borderOverlay} pointerEvents="none" />

      <View style={s.content}>
        {/* 头部：任务名 + 类型角标 */}
        <View style={s.headerRow}>
          <Text style={s.questName} numberOfLines={1}>
            {quest.name}
          </Text>
          <View style={[s.typeBadge, { backgroundColor: typeColor + '20' }]}>
            <Text style={[s.typeText, { color: typeColor }]}>{typeLabel}</Text>
          </View>
        </View>

        {/* 任务描述 */}
        <Text style={s.desc} numberOfLines={2}>
          {quest.description}
        </Text>

        {/* 目标进度列表 */}
        <View style={s.objectives}>
          {quest.objectives.map((obj, idx) => (
            <ObjectiveProgress key={`obj-${idx}`} objective={obj} />
          ))}
        </View>

        {/* 底部：状态 + 放弃按钮 */}
        <View style={s.footerRow}>
          {isReady ? (
            <View style={s.readyBadge}>
              <Text style={s.readyText}>可交付</Text>
            </View>
          ) : (
            <Text style={s.giverText}>来自: {quest.giverNpcName}</Text>
          )}
          <TouchableOpacity
            style={s.abandonBtn}
            onPress={() => onAbandon(quest.questId)}
            activeOpacity={0.7}
          >
            <Text style={s.abandonText}>放弃</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  card: {
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: '#8B7A5A30',
    borderRadius: 3,
  },
  content: {
    padding: 12,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  questName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Noto Serif SC',
  },
  desc: {
    fontSize: 12,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    lineHeight: 18,
  },
  objectives: {
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  readyBadge: {
    backgroundColor: '#5A8A6A20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 3,
  },
  readyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#5A8A6A',
    fontFamily: 'Noto Serif SC',
  },
  giverText: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  abandonBtn: {
    backgroundColor: '#8B5A5A15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#8B5A5A40',
  },
  abandonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B5A5A',
    fontFamily: 'Noto Serif SC',
  },
});
