/**
 * 战斗区域容器
 * 从 Zustand store 取 combat 切片数据，分发给子组件
 * 战斗结束时显示结算信息覆盖层
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../../../stores/useGameStore';
import { GradientDivider } from '../shared';
import { CombatHeader } from './CombatHeader';
import { FighterPanel } from './FighterPanel';
import { CombatLog } from './CombatLog';
import { FleeButton } from './FleeButton';

/** 结算原因 → 显示文本 */
const RESULT_LABEL: Record<string, string> = {
  victory: '胜利',
  defeat: '落败',
  flee: '脱身',
};

/** 结算原因 → 颜色 */
const RESULT_COLOR: Record<string, string> = {
  victory: '#4A6B4A',
  defeat: '#A65D5D',
  flee: '#B8860B',
};

export const Combat = () => {
  const insets = useSafeAreaInsets();
  const combat = useGameStore(state => state.combat);
  const sendCommand = useGameStore(state => state.sendCommand);

  const { player, enemy, log, result } = combat;

  /** 逃跑处理 */
  const handleFlee = () => {
    sendCommand('flee');
  };

  /** 数据未到达时的占位 */
  if (!player || !enemy) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <Text style={s.loadingText}>正在进入战斗...</Text>
      </View>
    );
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* 头部：双方名字和等级 */}
      <CombatHeader
        playerName={player.name}
        playerLevel={player.level}
        enemyName={enemy.name}
        enemyLevel={enemy.level}
      />

      <GradientDivider opacity={0.38} />

      {/* 双方战斗面板 */}
      <View style={s.panelsRow}>
        <FighterPanel
          name={player.name}
          hp={player.hp}
          maxHp={player.maxHp}
          atbPct={player.atbPct}
          isPlayer={true}
        />
        <FighterPanel
          name={enemy.name}
          hp={enemy.hp}
          maxHp={enemy.maxHp}
          atbPct={enemy.atbPct}
          isPlayer={false}
        />
      </View>

      <GradientDivider opacity={0.24} />

      {/* 战斗日志 */}
      <CombatLog actions={log} />

      {/* 逃跑按钮（战斗结束时禁用） */}
      <FleeButton onFlee={handleFlee} disabled={result !== null} />

      {/* 结算覆盖层 */}
      {result && (
        <View style={s.overlay}>
          <View style={s.resultBox}>
            <Text
              style={[
                s.resultTitle,
                { color: RESULT_COLOR[result.reason] || '#3A3530' },
              ]}
            >
              {RESULT_LABEL[result.reason] || result.reason}
            </Text>
            <Text style={s.resultMsg}>{result.message}</Text>
            <Text style={s.resultHint}>即将返回...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 14,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  panelsRow: {
    flexDirection: 'row',
    flexShrink: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(58, 53, 48, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultBox: {
    backgroundColor: '#F5F0E8',
    paddingHorizontal: 40,
    paddingVertical: 28,
    borderRadius: 4,
    alignItems: 'center',
    gap: 8,
    // 水墨风阴影
    shadowColor: '#3A3530',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Noto Serif SC',
  },
  resultMsg: {
    fontSize: 13,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    textAlign: 'center',
  },
  resultHint: {
    fontSize: 11,
    color: '#A09888',
    fontFamily: 'Noto Serif SC',
    marginTop: 4,
  },
});
