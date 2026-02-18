/**
 * SectSkillCard -- 门派技能卡片
 * 展示技能名称、解锁状态、当前等级、锁定原因
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { SectSkillNode } from '@packages/core';

interface SectSkillCardProps {
  skill: SectSkillNode;
  onPress: (skill: SectSkillNode) => void;
}

/** 解锁状态对应的图标字符 */
const STATE_ICON: Record<string, string> = {
  learned: '✦',
  available: '◉',
  locked: '◎',
  crippled: '✕',
};

/** 解锁状态对应的颜色 */
const STATE_COLOR: Record<string, string> = {
  learned: '#2F7A3F',
  available: '#2E6B8A',
  locked: '#A09888',
  crippled: '#A03030',
};

export const SectSkillCard = ({ skill, onPress }: SectSkillCardProps) => {
  const isLocked = skill.unlockState === 'locked';
  const isCrippled = skill.unlockState === 'crippled';
  const isLearned = skill.unlockState === 'learned';
  const stateColor = STATE_COLOR[skill.unlockState] ?? '#A09888';
  const stateIcon = STATE_ICON[skill.unlockState] ?? '?';

  return (
    <TouchableOpacity
      style={[s.card, (isLocked || isCrippled) ? s.cardDimmed : undefined]}
      onPress={() => onPress(skill)}
      activeOpacity={0.7}
    >
      {/* 状态图标 */}
      <Text style={[s.stateIcon, { color: stateColor }]}>{stateIcon}</Text>

      {/* 技能名称 */}
      <Text
        style={[s.name, (isLocked || isCrippled) ? s.nameDimmed : undefined]}
        numberOfLines={1}
      >
        {skill.skillName}
      </Text>

      {/* 等级（已学才显示） */}
      {isLearned && skill.currentLevel > 0 ? (
        <Text style={s.level}>Lv.{skill.currentLevel}</Text>
      ) : null}

      {/* 锁定原因（锁定/残废时显示简短提示） */}
      {(isLocked || isCrippled) && skill.unlockMessage ? (
        <Text style={s.lockHint} numberOfLines={1}>
          {skill.unlockMessage}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  card: {
    backgroundColor: '#F5F0E8',
    borderWidth: 1,
    borderColor: '#8B7A5A30',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 90,
    maxWidth: 120,
    alignItems: 'center',
    gap: 3,
  },
  cardDimmed: {
    opacity: 0.6,
  },
  stateIcon: {
    fontSize: 16,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    textAlign: 'center',
  },
  nameDimmed: {
    color: '#8B7A5A',
  },
  level: {
    fontSize: 10,
    color: '#2F7A3F',
    fontWeight: '600',
    fontFamily: 'Noto Serif SC',
  },
  lockHint: {
    fontSize: 9,
    color: '#A09888',
    fontFamily: 'Noto Serif SC',
    textAlign: 'center',
  },
});
