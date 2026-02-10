/**
 * NPC 任务区域 — NPC 弹窗内展示可交互任务
 * 根据任务状态(available/active/ready)渲染不同 UI
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from '../../LinearGradient';
import type { NpcQuestBrief } from '../../../stores/useGameStore';

/** QuestSection Props */
interface QuestSectionProps {
  quests: NpcQuestBrief[];
  npcId: string;
  npcName: string;
  onAccept: (questId: string, npcId: string) => void;
  onComplete: (questId: string, npcId: string) => void;
}

/** 状态标签颜色映射 */
const STATE_COLORS: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  available: { bg: '#8B7A5A20', text: '#8B7A5A', label: '可接受' },
  active: { bg: '#4A7A9A20', text: '#4A7A9A', label: '进行中' },
  ready: { bg: '#6B8A4A20', text: '#6B8A4A', label: '可交付' },
};

/** 单条任务渲染 */
const QuestItem = ({
  quest,
  npcId,
  onAccept,
  onComplete,
}: {
  quest: NpcQuestBrief;
  npcId: string;
  onAccept: (questId: string, npcId: string) => void;
  onComplete: (questId: string, npcId: string) => void;
}) => {
  const stateInfo = STATE_COLORS[quest.state] || STATE_COLORS.available;

  return (
    <View style={s.questItem}>
      {/* 任务名 + 状态标签 */}
      <View style={s.questHeader}>
        <Text style={s.questName} numberOfLines={1}>
          {quest.name}
        </Text>
        <View style={[s.stateBadge, { backgroundColor: stateInfo.bg }]}>
          <Text style={[s.stateText, { color: stateInfo.text }]}>
            {stateInfo.label}
          </Text>
        </View>
      </View>

      {/* 任务描述 */}
      <Text style={s.questDesc} numberOfLines={2}>
        {quest.description}
      </Text>

      {/* 进行中：目标进度 */}
      {quest.state === 'active' &&
        quest.objectives &&
        quest.objectives.length > 0 && (
          <View style={s.objectivesWrap}>
            {quest.objectives.map((obj, idx) => (
              <View key={idx} style={s.objectiveRow}>
                <Text
                  style={[
                    s.objectiveText,
                    obj.completed && s.objectiveCompleted,
                  ]}
                >
                  {obj.completed ? '[v]' : '[ ]'} {obj.description}
                </Text>
                <Text style={s.objectiveProgress}>
                  {obj.current}/{obj.required}
                </Text>
              </View>
            ))}
          </View>
        )}

      {/* 按钮区域 */}
      {quest.state === 'available' && (
        <TouchableOpacity
          style={s.actionBtnWrap}
          activeOpacity={0.7}
          onPress={() => onAccept(quest.questId, npcId)}
        >
          <View style={s.actionBtn}>
            <LinearGradient
              colors={['#D5CEC0', '#C9C2B4', '#B8B0A0']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
            <Text style={s.actionBtnText}>接受任务</Text>
          </View>
        </TouchableOpacity>
      )}

      {quest.state === 'ready' && (
        <TouchableOpacity
          style={s.actionBtnWrap}
          activeOpacity={0.7}
          onPress={() => onComplete(quest.questId, npcId)}
        >
          <View style={[s.actionBtn, s.actionBtnReady]}>
            <LinearGradient
              colors={['#C5D0B8', '#B8C4AA', '#A8B498']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
            <Text style={[s.actionBtnText, s.actionBtnTextReady]}>
              完成任务
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export const QuestSection = ({
  quests,
  npcId,
  npcName,
  onAccept,
  onComplete,
}: QuestSectionProps) => {
  if (!quests || quests.length === 0) return null;

  return (
    <View style={s.container}>
      <Text style={s.sectionTitle}>任务</Text>
      {quests.map(quest => (
        <QuestItem
          key={quest.questId}
          quest={quest}
          npcId={npcId}
          onAccept={onAccept}
          onComplete={onComplete}
        />
      ))}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    marginBottom: 2,
  },
  questItem: {
    borderWidth: 1,
    borderColor: '#8B7A5A30',
    padding: 8,
    gap: 4,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  questName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    flex: 1,
  },
  stateBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  stateText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Noto Serif SC',
  },
  questDesc: {
    fontSize: 12,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    lineHeight: 18,
  },
  objectivesWrap: {
    marginTop: 2,
    gap: 2,
  },
  objectiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  objectiveText: {
    fontSize: 11,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    flex: 1,
  },
  objectiveCompleted: {
    color: '#6B8A4A',
  },
  objectiveProgress: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
    marginLeft: 6,
  },
  actionBtnWrap: {
    marginTop: 4,
  },
  actionBtn: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B7A5A80',
    borderRadius: 2,
    overflow: 'hidden',
  },
  actionBtnReady: {
    borderColor: '#6B8A4A80',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 1,
  },
  actionBtnTextReady: {
    color: '#2F5D3A',
  },
});
