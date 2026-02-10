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
  onEquipToggle?: (skill: PlayerSkillInfo) => void;
}

export const SkillListItem = ({
  skill,
  onPress,
  onEquipToggle,
}: SkillListItemProps) => {
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

      {/* 右侧: 等级 + 装配/卸下按钮 */}
      <View style={s.rightRow}>
        <Text style={[s.level, skill.isLocked ? s.textLocked : undefined]}>
          Lv.{skill.level}
        </Text>
        {onEquipToggle && !skill.isLocked ? (
          <TouchableOpacity
            style={[s.equipBtn, skill.isMapped ? s.equipBtnActive : undefined]}
            onPress={() => onEquipToggle(skill)}
            activeOpacity={0.7}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Text
              style={[
                s.equipBtnText,
                skill.isMapped ? s.equipBtnTextActive : undefined,
              ]}
            >
              {skill.isMapped ? '卸下' : '装配'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

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
  rightRow: {
    position: 'absolute',
    right: 4,
    top: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  level: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
  },
  equipBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#8B7A5A60',
    backgroundColor: '#F5F0E8',
  },
  equipBtnActive: {
    borderColor: '#4CAF5060',
    backgroundColor: '#4CAF5010',
  },
  equipBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  equipBtnTextActive: {
    color: '#4CAF50',
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
