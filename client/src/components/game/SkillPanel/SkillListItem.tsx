/**
 * SkillListItem -- 技能列表项
 * 显示技能名称 + 等级 + 经验进度条 + 映射状态标记
 * 内功激活时显示特殊标记
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from '../../LinearGradient';
import type { PlayerSkillInfo } from '@packages/core';

interface SkillListItemProps {
  skill: PlayerSkillInfo;
  onPress: (skillId: string) => void;
}

export const SkillListItem = ({ skill, onPress }: SkillListItemProps) => {
  /** 经验进度百分比 */
  const expPct =
    skill.learnedMax > 0
      ? Math.min((skill.learned / skill.learnedMax) * 100, 100)
      : 0;

  return (
    <TouchableOpacity
      style={[s.container, skill.isLocked ? s.containerLocked : undefined]}
      onPress={() => onPress(skill.skillId)}
      activeOpacity={0.7}
      disabled={skill.isLocked}
    >
      {/* 左侧: 映射绿点 + 技能名 */}
      <View style={s.nameRow}>
        {skill.isMapped ? <View style={s.mappedDot} /> : null}
        <Text
          style={[s.name, skill.isLocked ? s.textLocked : undefined]}
          numberOfLines={1}
        >
          {skill.skillName}
        </Text>
        {skill.isActiveForce ? (
          <View style={s.forceBadge}>
            <Text style={s.forceBadgeText}>运功</Text>
          </View>
        ) : null}
      </View>

      {/* 右侧: 等级 */}
      <Text style={[s.level, skill.isLocked ? s.textLocked : undefined]}>
        Lv.{skill.level}
      </Text>

      {/* 底部: 经验进度条 */}
      <View style={s.expBarOuter}>
        <View style={s.expBarBg}>
          <LinearGradient
            colors={['#8B7A5A', '#6B5A3A']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[s.expBarFill, { width: `${expPct}%` }]}
          />
        </View>
        <Text style={s.expText}>
          {skill.learned}/{skill.learnedMax}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D4C9B8',
    gap: 4,
  },
  containerLocked: {
    opacity: 0.4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  mappedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  textLocked: {
    color: '#A09888',
  },
  forceBadge: {
    backgroundColor: '#8B7A5A25',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#8B7A5A60',
  },
  forceBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  level: {
    position: 'absolute',
    right: 4,
    top: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
  },
  expBarOuter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: '#E8E0D0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  expBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 2,
  },
  expText: {
    fontSize: 9,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
    minWidth: 50,
    textAlign: 'right',
  },
});
