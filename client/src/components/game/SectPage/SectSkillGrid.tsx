/**
 * SectSkillGrid -- 门派技能网格
 * 按阶层(tier)分行展示：入门 → 进阶 → 绝学 → 典藏
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { SectSkillNode } from '@packages/core';
import { SectSkillCard } from './SectSkillCard';
import { SectSkillDetailModal } from './SectSkillDetailModal';

interface SectSkillGridProps {
  skills: SectSkillNode[];
}

/** 阶层配置：排序顺序 + 中文标签 */
const TIER_CONFIG: { tier: string; label: string }[] = [
  { tier: 'entry', label: '入门' },
  { tier: 'advanced', label: '进阶' },
  { tier: 'ultimate', label: '绝学' },
  { tier: 'canon', label: '典藏' },
];

export const SectSkillGrid = ({ skills }: SectSkillGridProps) => {
  const [selectedSkill, setSelectedSkill] = useState<SectSkillNode | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleCardPress = useCallback((skill: SectSkillNode) => {
    setSelectedSkill(skill);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedSkill(null);
  }, []);

  return (
    <View style={s.container}>
      <Text style={s.sectionTitle}>门派武学</Text>

      {TIER_CONFIG.map(({ tier, label }) => {
        const tierSkills = skills.filter(sk => sk.tier === tier);
        if (tierSkills.length === 0) return null;

        return (
          <View key={tier} style={s.tierRow}>
            <Text style={s.tierLabel}>{label}</Text>
            <View style={s.cardRow}>
              {tierSkills.map(sk => (
                <SectSkillCard
                  key={sk.skillId}
                  skill={sk}
                  onPress={handleCardPress}
                />
              ))}
            </View>
          </View>
        );
      })}

      {/* 技能详情弹窗 */}
      <SectSkillDetailModal
        visible={modalVisible}
        skill={selectedSkill}
        onClose={handleCloseModal}
      />
    </View>
  );
};

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
  tierRow: {
    gap: 6,
  },
  tierLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    paddingHorizontal: 4,
  },
  cardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 4,
  },
});
