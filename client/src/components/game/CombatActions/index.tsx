/**
 * CombatActions — 战斗招式快捷栏容器
 * 战斗全程始终可见，非出手回合灰显不可点
 * 包含倒计时进度条 + 快捷按钮栏 + "更多"展开弹窗
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { MessageFactory } from '@packages/core';
import type { CombatActionOption } from '@packages/core';
import { useGameStore } from '../../../stores/useGameStore';
import { wsService } from '../../../services/WebSocketService';
import { ActionBar } from './ActionBar';
import { ActionExpandModal } from './ActionExpandModal';

export const CombatActions = () => {
  /* ─── 从 store 取数据 ─── */
  const awaitingAction = useGameStore(state => state.combat.awaitingAction);
  const availableActions = useGameStore(state => state.combat.availableActions);
  const actionTimeout = useGameStore(state => state.combat.actionTimeout);
  const combatId = useGameStore(state => state.combat.combatId);

  /* ─── 本地状态 ─── */
  const [expandVisible, setExpandVisible] = useState(false);
  const [remainMs, setRemainMs] = useState(0);

  /** 倒计时动画值（1 → 0） */
  const progressAnim = useRef(new Animated.Value(1)).current;
  /** 倒计时定时器 */
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /** 记录开始等待的时刻 */
  const startTimeRef = useRef(0);

  /* ─── 倒计时逻辑 ─── */
  useEffect(() => {
    // 清理上一轮定时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!awaitingAction || actionTimeout <= 0) {
      progressAnim.setValue(1);
      setRemainMs(0);
      return;
    }

    // 初始化
    startTimeRef.current = Date.now();
    setRemainMs(actionTimeout);
    progressAnim.setValue(1);

    // 启动进度条动画
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: actionTimeout,
      useNativeDriver: false,
    }).start();

    // 启动倒计时文本更新（每 100ms）
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const left = Math.max(0, actionTimeout - elapsed);
      setRemainMs(left);
      if (left <= 0 && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 100);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      progressAnim.stopAnimation();
    };
  }, [awaitingAction, actionTimeout, progressAnim]);

  /* ─── 发送招式选择 ─── */
  const handleActionPress = useCallback(
    (action: CombatActionOption) => {
      // 必须在出手回合、可用、且冷却完毕
      if (!combatId || !awaitingAction || !action.canUse || action.cooldownRemaining > 0) return;
      wsService.send(
        MessageFactory.create('skillUse', {
          combatId,
          actionIndex: action.index,
        }),
      );
      setExpandVisible(false);
    },
    [combatId, awaitingAction],
  );

  /** "更多"展开弹窗中选择招式 */
  const handleExpandSelect = useCallback(
    (action: CombatActionOption) => {
      handleActionPress(action);
    },
    [handleActionPress],
  );

  /* ─── 无可用招式时不渲染 ─── */
  if (availableActions.length === 0) return null;

  /** 倒计时秒数显示 */
  const remainSec = (remainMs / 1000).toFixed(1);
  /** 是否接近超时（< 3 秒） */
  const isUrgent = remainMs > 0 && remainMs < 3000;

  /** 进度条颜色 — 接近超时时变红 */
  const barColor = progressAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: ['#C0392B', '#C0392B', '#6B5A3A'],
  });

  /** 进度条宽度百分比 */
  const barWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[s.container, !awaitingAction && s.containerInactive]}>
      {/* 倒计时进度条 — 仅出手回合显示 */}
      {awaitingAction ? (
        <View style={s.timerRow}>
          <Text style={s.timerLabel}>行动</Text>
          <View style={s.timerBarBg}>
            <Animated.View
              style={[
                s.timerBarFill,
                { width: barWidth, backgroundColor: barColor },
              ]}
            />
          </View>
          <Text style={[s.timerText, isUrgent && s.timerUrgent]}>
            {remainSec}s
          </Text>
        </View>
      ) : null}

      {/* 快捷栏 */}
      <ActionBar
        actions={availableActions}
        onActionPress={handleActionPress}
        onMorePress={() => setExpandVisible(true)}
        disabled={!awaitingAction}
      />

      {/* 展开弹窗 */}
      <ActionExpandModal
        visible={expandVisible}
        actions={availableActions}
        onSelect={handleExpandSelect}
        onClose={() => setExpandVisible(false)}
        awaitingAction={awaitingAction}
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(245, 240, 232, 0.95)',
    borderWidth: 1,
    borderColor: '#8B7A5A40',
    paddingVertical: 6,
    gap: 6,
  },
  /** 非出手回合降低整体透明度 */
  containerInactive: {
    opacity: 0.6,
  },
  /* 倒计时行 */
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 6,
  },
  timerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  timerBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: '#8B7A5A20',
    borderRadius: 2,
    overflow: 'hidden',
  },
  timerBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  timerText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
    minWidth: 32,
    textAlign: 'right',
  },
  timerUrgent: {
    color: '#C0392B',
  },
});
