/**
 * SectSkillDetailModal -- 门派技能详情弹窗
 * 展示技能完整信息：名称、阶层、槽位、解锁状态、等级、解锁条件列表
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import type { SectSkillNode } from '@packages/core';

interface SectSkillDetailModalProps {
  visible: boolean;
  skill: SectSkillNode | null;
  onClose: () => void;
}

/** 阶层中文映射 */
const TIER_LABEL: Record<string, string> = {
  entry: '入门',
  advanced: '进阶',
  ultimate: '绝学',
  canon: '典藏',
};

/** 槽位中文映射 */
const SLOT_LABEL: Record<string, string> = {
  blade: '刀法',
  sword: '剑法',
  staff: '杖法',
  fist: '拳法',
  palm: '掌法',
  finger: '指法',
  kick: '腿法',
  dodge: '轻功',
  parry: '格挡',
  force: '内功',
  cognize: '心法',
};

/** 解锁状态文案 */
const STATE_LABEL: Record<string, string> = {
  learned: '已掌握',
  available: '可学习',
  locked: '未解锁',
  crippled: '已废',
};

const STATE_COLOR: Record<string, string> = {
  learned: '#2F7A3F',
  available: '#2E6B8A',
  locked: '#A09888',
  crippled: '#A03030',
};

export const SectSkillDetailModal = ({
  visible,
  skill,
  onClose,
}: SectSkillDetailModalProps) => {
  if (!skill) return null;

  const stateColor = STATE_COLOR[skill.unlockState] ?? '#A09888';
  const stateLabel = STATE_LABEL[skill.unlockState] ?? skill.unlockState;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={s.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={s.dialog}
          activeOpacity={1}
          onPress={() => {}}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* 标题行 */}
            <View style={s.headerRow}>
              <Text style={s.skillName}>{skill.skillName}</Text>
              <View style={[s.stateBadge, { borderColor: stateColor + '60' }]}>
                <Text style={[s.stateText, { color: stateColor }]}>
                  {stateLabel}
                </Text>
              </View>
            </View>

            {/* 基础信息 */}
            <View style={s.infoBlock}>
              <InfoRow label="阶层" value={TIER_LABEL[skill.tier] ?? skill.tier} />
              <InfoRow label="类型" value={SLOT_LABEL[skill.slot] ?? skill.slot} />
              {skill.currentLevel > 0 ? (
                <InfoRow label="等级" value={`${skill.currentLevel}`} />
              ) : null}
            </View>

            {/* 解锁提示 */}
            {skill.unlockMessage ? (
              <View style={s.messageBlock}>
                <Text style={s.messageText}>{skill.unlockMessage}</Text>
              </View>
            ) : null}

            {/* 解锁条件列表 */}
            {skill.unlockConditions.length > 0 ? (
              <View style={s.conditionsBlock}>
                <Text style={s.conditionsTitle}>解锁条件</Text>
                {skill.unlockConditions.map((cond, idx) => (
                  <View key={idx} style={s.conditionRow}>
                    <Text style={s.condBullet}>·</Text>
                    <Text style={s.condText}>{cond}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </ScrollView>

          {/* 关闭按钮 */}
          <TouchableOpacity
            style={s.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={s.closeBtnText}>关闭</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

/** 信息行 */
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={s.infoRow}>
    <Text style={s.infoLabel}>{label}</Text>
    <Text style={s.infoValue}>{value}</Text>
  </View>
);

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  dialog: {
    backgroundColor: '#F5F0E8',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#8B7A5A40',
    padding: 16,
    width: '100%',
    maxHeight: '70%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  skillName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  stateBadge: {
    borderWidth: 1,
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  stateText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Noto Serif SC',
  },
  infoBlock: {
    gap: 6,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    width: 40,
  },
  infoValue: {
    fontSize: 12,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  messageBlock: {
    backgroundColor: '#8B7A5A10',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 12,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    lineHeight: 18,
  },
  conditionsBlock: {
    gap: 4,
    marginBottom: 12,
  },
  conditionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    marginBottom: 2,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingLeft: 4,
  },
  condBullet: {
    fontSize: 12,
    color: '#A09888',
    lineHeight: 18,
  },
  condText: {
    flex: 1,
    fontSize: 12,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    lineHeight: 18,
  },
  closeBtn: {
    marginTop: 8,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#8B7A5A50',
    borderRadius: 3,
    backgroundColor: '#F5F0E8',
  },
  closeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
});
