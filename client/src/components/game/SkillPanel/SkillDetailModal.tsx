/**
 * SkillDetailModal -- 技能招式详情弹窗
 * 嵌套 Modal，展示技能描述 + 招式列表
 * 打开时发送 skillPanelRequest 带 detailSkillId 获取详情数据
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import LinearGradient from '../../LinearGradient';
import { GradientDivider } from '../shared';
import { MessageFactory } from '@packages/core';
import type { ActionDetailInfo } from '@packages/core';
import { wsService } from '../../../services/WebSocketService';
import { useSkillStore } from '../../../stores/useSkillStore';
import { useGameStore } from '../../../stores/useGameStore';
import { ActionListItem } from './ActionListItem';

interface SkillDetailModalProps {
  visible: boolean;
  onClose: () => void;
  skillId: string | null;
  showEquipToggle?: boolean;
  actionLabel?: string;
  onActionPress?: (skillId: string) => void;
}

const DESCRIPTION_TITLES = ['【背景】', '【学习条件】', '【战斗公式】', '【扩展】'];

function splitDescriptionSections(
  description: string,
): Array<{ title: string; body: string }> {
  const sections = DESCRIPTION_TITLES.map((title, index) => {
    const start = description.indexOf(title);
    if (start === -1) return null;

    const endCandidates = DESCRIPTION_TITLES.slice(index + 1)
      .map(next => description.indexOf(next))
      .filter(pos => pos !== -1);
    const end =
      endCandidates.length > 0 ? Math.min(...endCandidates) : description.length;

    const body = description
      .slice(start + title.length, end)
      .replace(/^\s+|\s+$/g, '');
    return { title, body };
  }).filter(Boolean) as Array<{ title: string; body: string }>;

  return sections;
}

export const SkillDetailModal = ({
  visible,
  onClose,
  skillId,
  showEquipToggle = true,
  actionLabel,
  onActionPress,
}: SkillDetailModalProps) => {
  const skillDetail = useSkillStore(state => state.skillDetail);
  const skills = useSkillStore(state => state.skills);
  const lastLearnResult = useSkillStore(state => state.lastLearnResult);
  const clearLearnResult = useSkillStore(state => state.clearLearnResult);
  const sendCommand = useGameStore(state => state.sendCommand);

  /** 当前技能的映射状态 */
  const currentSkill = skillId ? skills.find(s => s.skillId === skillId) : null;
  const isMapped = currentSkill?.isMapped ?? false;
  const canShowLearnFeedback =
    !!lastLearnResult && !!skillId && lastLearnResult.skillId === skillId;
  const descSections = skillDetail?.description
    ? splitDescriptionSections(skillDetail.description)
    : [];

  /** 装配/卸下操作 */
  const handleEquipToggle = () => {
    if (!currentSkill) return;
    const cmd = isMapped
      ? `disable ${currentSkill.skillName}`
      : `enable ${currentSkill.skillName}`;
    sendCommand(cmd);
  };

  /** 打开时请求技能详情 */
  useEffect(() => {
    if (visible && skillId) {
      wsService.send(
        MessageFactory.create('skillPanelRequest', {
          detailSkillId: skillId,
        }),
      );
    }
    // 关闭时清空详情
    if (!visible) {
      useSkillStore.getState().setSkillDetail(null);
      clearLearnResult();
    }
  }, [visible, skillId, clearLearnResult]);

  /** 渲染招式列表项 */
  const renderAction = ({ item }: { item: ActionDetailInfo }) => (
    <ActionListItem action={item} />
  );

  const keyExtractor = (_: ActionDetailInfo, index: number) =>
    `${_.skillName}-${index}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={s.card}>
              {/* 渐变背景 */}
              <LinearGradient
                colors={['#F5F0E8', '#EBE5DA', '#E0D9CC', '#D5CEC0']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
              />
              <View style={s.borderOverlay} pointerEvents="none" />

              <View style={s.content}>
                {/* 头部 */}
                <View style={s.headerRow}>
                  <Text style={s.headerText} numberOfLines={1}>
                    {skillDetail?.skillName || '---'}
                  </Text>
                  <TouchableOpacity
                    onPress={onClose}
                    style={s.closeBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={s.closeBtnText}>&#10005;</Text>
                  </TouchableOpacity>
                </View>
                <Text style={s.headerMeta}>
                  {currentSkill
                    ? `当前境界 Lv.${currentSkill.level} · 进度 ${currentSkill.learned}/${currentSkill.learnedMax}`
                    : '可观摩此法门招式与修行要旨'}
                </Text>

                <View style={s.dividerWrap}>
                  <GradientDivider />
                </View>

                {/* 技能描述 */}
                {skillDetail?.description ? (
                  <View>
                    {descSections.length > 0 ? (
                      <View style={s.descSectionWrap}>
                        {descSections.map(section => (
                          <View key={section.title} style={s.descSection}>
                            <Text style={s.descSectionTitle}>
                              {section.title.replace(/[【】]/g, '')}
                            </Text>
                            <Text style={s.desc}>{section.body}</Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={s.desc}>{skillDetail.description}</Text>
                    )}
                    <View style={s.dividerWrap}>
                      <GradientDivider />
                    </View>
                  </View>
                ) : null}

                {canShowLearnFeedback ? (
                  <View
                    style={[
                      s.learnFeedback,
                      lastLearnResult?.success
                        ? s.learnFeedbackSuccess
                        : s.learnFeedbackFail,
                    ]}
                  >
                    <Text style={s.learnFeedbackTitle}>
                      {lastLearnResult?.success ? '学艺有得' : '学艺受阻'}
                    </Text>
                    <Text style={s.learnFeedbackText}>{lastLearnResult?.message}</Text>
                  </View>
                ) : null}

                {currentSkill?.isLocked ? (
                  <View style={s.lockNote}>
                    <Text style={s.lockNoteTitle}>断裂传承</Text>
                    <Text style={s.lockNoteText}>
                      此技能处于锁定状态，无法装配与精进，仅保留残篇心得。
                    </Text>
                  </View>
                ) : null}

                {/* 装配/卸下按钮 */}
                {showEquipToggle && currentSkill && !currentSkill.isLocked ? (
                  <View style={s.equipRow}>
                    <TouchableOpacity
                      style={[
                        s.equipBtn,
                        isMapped ? s.equipBtnUnmap : undefined,
                      ]}
                      onPress={handleEquipToggle}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          s.equipBtnText,
                          isMapped ? s.equipBtnTextUnmap : undefined,
                        ]}
                      >
                        {isMapped ? '卸下技能' : '装配技能'}
                      </Text>
                    </TouchableOpacity>
                    <View style={s.dividerWrap}>
                      <GradientDivider />
                    </View>
                  </View>
                ) : null}

                {/* 外部动作按钮（如：向师父学习） */}
                {actionLabel && skillId && onActionPress ? (
                  <View style={s.equipRow}>
                    <TouchableOpacity
                      style={[s.equipBtn, s.learnBtn]}
                      onPress={() => onActionPress(skillId)}
                      activeOpacity={0.7}
                    >
                      <Text style={[s.equipBtnText, s.learnBtnText]}>{actionLabel}</Text>
                    </TouchableOpacity>
                    <View style={s.dividerWrap}>
                      <GradientDivider />
                    </View>
                  </View>
                ) : null}

                {/* 招式列表 */}
                <Text style={s.sectionTitle}>
                  招式 ({skillDetail?.actions?.length || 0})
                </Text>

                {skillDetail?.actions && skillDetail.actions.length > 0 ? (
                  <View style={s.actionListWrap}>
                    <FlatList
                      data={skillDetail.actions}
                      renderItem={renderAction}
                      keyExtractor={keyExtractor}
                      style={s.actionList}
                      showsVerticalScrollIndicator={false}
                    />
                  </View>
                ) : (
                  <Text style={s.emptyText}>
                    {skillDetail ? '暂无招式' : '加载中...'}
                  </Text>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    maxHeight: '78%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: '#8B7A5A55',
    borderRadius: 10,
  },
  content: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 1,
  },
  headerMeta: {
    marginTop: 2,
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  closeBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
  },
  dividerWrap: {
    marginVertical: 8,
  },
  desc: {
    fontSize: 12,
    color: '#5A5550',
    fontFamily: 'Noto Serif SC',
    lineHeight: 20,
  },
  descSectionWrap: {
    gap: 8,
  },
  descSection: {
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#8B7A5A35',
    backgroundColor: '#FFFFFF40',
  },
  descSectionTitle: {
    fontSize: 11,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  learnFeedback: {
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  learnFeedbackSuccess: {
    borderColor: '#3F6A4D66',
    backgroundColor: '#3F6A4D14',
  },
  learnFeedbackFail: {
    borderColor: '#8B3A3A66',
    backgroundColor: '#8B3A3A14',
  },
  learnFeedbackTitle: {
    fontSize: 11,
    fontFamily: 'Noto Serif SC',
    fontWeight: '700',
    color: '#5A472D',
  },
  learnFeedbackText: {
    fontSize: 11,
    fontFamily: 'Noto Serif SC',
    color: '#5A5550',
    lineHeight: 17,
  },
  lockNote: {
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#8B3A3A55',
    backgroundColor: '#8B3A3A12',
  },
  lockNoteTitle: {
    fontSize: 12,
    color: '#7A2F1A',
    fontFamily: 'Noto Serif SC',
    fontWeight: '700',
    marginBottom: 2,
  },
  lockNoteText: {
    fontSize: 11,
    color: '#6B3E31',
    fontFamily: 'Noto Serif SC',
    lineHeight: 17,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    marginBottom: 6,
  },
  actionListWrap: {
    maxHeight: 300,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#8B7A5A35',
    borderRadius: 4,
    backgroundColor: '#FFFFFF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  actionList: {
    maxHeight: 292,
  },
  equipRow: {
    marginBottom: 2,
  },
  equipBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#8B7A5A60',
    backgroundColor: '#8B7A5A10',
    marginBottom: 8,
  },
  equipBtnUnmap: {
    borderColor: '#D4604060',
    backgroundColor: '#D4604010',
  },
  equipBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  equipBtnTextUnmap: {
    color: '#D46040',
  },
  learnBtn: {
    borderColor: '#7C633E88',
    backgroundColor: '#7C633E18',
  },
  learnBtnText: {
    color: '#5A472D',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#A09888',
    fontFamily: 'Noto Serif SC',
    paddingVertical: 20,
  },
});
