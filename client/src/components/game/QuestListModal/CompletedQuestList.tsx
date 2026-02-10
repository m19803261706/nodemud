/**
 * 已完成任务折叠列表 — 默认收起，点击标题展开
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { CompletedQuestInfo } from '../../../stores/useGameStore';

interface CompletedQuestListProps {
  quests: CompletedQuestInfo[];
}

export const CompletedQuestList = ({ quests }: CompletedQuestListProps) => {
  const [expanded, setExpanded] = useState(false);

  if (quests.length === 0) return null;

  return (
    <View style={s.container}>
      {/* 折叠标题 */}
      <TouchableOpacity
        style={s.header}
        onPress={() => setExpanded(prev => !prev)}
        activeOpacity={0.7}
      >
        <Text style={s.headerText}>已完成 ({quests.length})</Text>
        <Text style={s.arrow}>{expanded ? '\u25B2' : '\u25BC'}</Text>
      </TouchableOpacity>

      {/* 展开内容 */}
      {expanded ? (
        <View style={s.list}>
          {quests.map(q => (
            <View key={q.questId} style={s.item}>
              <Text style={s.checkMark}>&#10003;</Text>
              <Text style={s.questName} numberOfLines={1}>
                {q.name}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  headerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  arrow: {
    fontSize: 10,
    color: '#8B7A5A',
  },
  list: {
    gap: 4,
    paddingHorizontal: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#8B7A5A20',
  },
  checkMark: {
    fontSize: 12,
    color: '#5A8A6A',
  },
  questName: {
    flex: 1,
    fontSize: 12,
    color: '#A09888',
    fontFamily: 'Noto Serif SC',
    textDecorationLine: 'line-through',
  },
});
