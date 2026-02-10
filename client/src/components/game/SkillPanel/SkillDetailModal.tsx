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
}

export const SkillDetailModal = ({
  visible,
  onClose,
  skillId,
}: SkillDetailModalProps) => {
  const skillDetail = useSkillStore(state => state.skillDetail);
  const skills = useSkillStore(state => state.skills);
  const sendCommand = useGameStore(state => state.sendCommand);

  /** 当前技能的映射状态 */
  const currentSkill = skillId ? skills.find(s => s.skillId === skillId) : null;
  const isMapped = currentSkill?.isMapped ?? false;

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
    }
  }, [visible, skillId]);

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

                <View style={s.dividerWrap}>
                  <GradientDivider />
                </View>

                {/* 技能描述 */}
                {skillDetail?.description ? (
                  <View>
                    <Text style={s.desc}>{skillDetail.description}</Text>
                    <View style={s.dividerWrap}>
                      <GradientDivider />
                    </View>
                  </View>
                ) : null}

                {/* 装配/卸下按钮 */}
                {currentSkill && !currentSkill.isLocked ? (
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

                {/* 招式列表 */}
                <Text style={s.sectionTitle}>
                  招式 ({skillDetail?.actions?.length || 0})
                </Text>

                {skillDetail?.actions && skillDetail.actions.length > 0 ? (
                  <FlatList
                    data={skillDetail.actions}
                    renderItem={renderAction}
                    keyExtractor={keyExtractor}
                    style={s.actionList}
                    showsVerticalScrollIndicator={false}
                  />
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
    width: '85%',
    maxHeight: '70%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: '#8B7A5A40',
    borderRadius: 4,
  },
  content: {
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#3A3530',
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
    fontSize: 13,
    color: '#5A5550',
    fontFamily: 'Noto Serif SC',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    marginBottom: 4,
  },
  actionList: {
    maxHeight: 280,
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
  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#A09888',
    fontFamily: 'Noto Serif SC',
    paddingVertical: 20,
  },
});
