/**
 * QuestListModal — 任务列表弹窗
 * 全屏水墨风弹窗，包含经验信息栏、进行中任务卡片、已完成任务列表
 * 从 store 取 quests + player 数据，通过 props 传递给子组件
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import LinearGradient from '../../LinearGradient';
import { GradientDivider } from '../shared';
import { useGameStore } from '../../../stores/useGameStore';
import { MessageFactory } from '@packages/core';
import { wsService } from '../../../services/WebSocketService';
import { ExpInfoBar } from './ExpInfoBar';
import { ActiveQuestCard } from './ActiveQuestCard';
import { CompletedQuestList } from './CompletedQuestList';

export const QuestListModal = () => {
  const visible = useGameStore(state => state.questModalVisible);
  const setVisible = useGameStore(state => state.setQuestModalVisible);
  const quests = useGameStore(state => state.quests);
  const player = useGameStore(state => state.player);

  const handleClose = () => {
    setVisible(false);
  };

  /** 放弃任务 — 发送 questAbandon 消息 */
  const handleAbandon = (questId: string) => {
    wsService.send(
      MessageFactory.serialize(
        MessageFactory.create('questAbandon', { questId }),
      ),
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={s.overlay}>
        <View style={s.card}>
          {/* 渐变背景 */}
          <LinearGradient
            colors={['#F5F0E8', '#EBE5DA', '#E0D9CC', '#D5CEC0']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
          <View style={s.borderOverlay} pointerEvents="none" />

          {/* 头部标题栏 */}
          <View style={s.header}>
            <Text style={s.headerTitle}>任务</Text>
            <TouchableOpacity
              onPress={handleClose}
              style={s.closeBtn}
              activeOpacity={0.7}
            >
              <Text style={s.closeBtnText}>&#10005;</Text>
            </TouchableOpacity>
          </View>

          <View style={s.headerDivider}>
            <GradientDivider />
          </View>

          {/* 内容区 */}
          <ScrollView
            style={s.scrollView}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 经验信息栏 */}
            <ExpInfoBar
              level={player.level}
              levelTitle={player.levelTitle}
              exp={player.exp}
              expToNextLevel={player.expToNextLevel}
              potential={player.potential}
              score={player.score}
            />

            <View style={s.sectionDivider}>
              <GradientDivider />
            </View>

            {/* 进行中任务 */}
            <Text style={s.sectionTitle}>进行中 ({quests.active.length})</Text>

            {quests.active.length > 0 ? (
              <View style={s.activeList}>
                {quests.active.map(quest => (
                  <ActiveQuestCard
                    key={quest.questId}
                    quest={quest}
                    onAbandon={handleAbandon}
                  />
                ))}
              </View>
            ) : (
              <Text style={s.emptyText}>暂无进行中的任务</Text>
            )}

            <View style={s.sectionDivider}>
              <GradientDivider />
            </View>

            {/* 已完成任务 */}
            <CompletedQuestList quests={quests.completed} />
          </ScrollView>
        </View>
      </View>
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
    width: '88%',
    height: '78%',
    maxHeight: 640,
    minHeight: 360,
    borderRadius: 4,
    overflow: 'hidden',
  },
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: '#8B7A5A40',
    borderRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 2,
  },
  closeBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
  },
  headerDivider: {
    paddingHorizontal: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
  },
  sectionDivider: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    marginBottom: 8,
  },
  activeList: {
    gap: 0,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#A09888',
    fontFamily: 'Noto Serif SC',
    paddingVertical: 20,
  },
});
