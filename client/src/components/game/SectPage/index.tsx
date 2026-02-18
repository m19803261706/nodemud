/**
 * SectPage -- 门派 Tab 全屏页面容器
 * 切换到门派 Tab 时发送 sectInfoRequest，根据数据渲染概览或空状态
 */

import React, { useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { MessageFactory } from '@packages/core';
import type { SectTeleportRole } from '@packages/core';
import { wsService } from '../../../services/WebSocketService';
import { useGameStore } from '../../../stores/useGameStore';
import { SectEmptyState } from './SectEmptyState';
import { SectOverview } from './SectOverview';
import { RankProgress } from './RankProgress';
import { SectProgress } from './SectProgress';
import { SectActions } from './SectActions';
import { LogScrollView } from '../shared/LogScrollView';

export const SectPage = () => {
  const sectInfo = useGameStore(state => state.sectInfo);

  /** 页面打开时请求最新门派数据 */
  useEffect(() => {
    wsService.send(MessageFactory.create('sectInfoRequest', {}));
  }, []);

  /** 传送到 NPC 所在房间 */
  const handleTeleport = useCallback((role: SectTeleportRole) => {
    wsService.send(MessageFactory.create('sectTeleport', { targetRole: role }));
  }, []);

  // 未入门 → 空状态
  const isEmpty = !sectInfo || !sectInfo.overview;

  return (
    <View style={s.container}>
      {isEmpty ? (
        <View style={s.emptyWrap}>
          <SectEmptyState />
        </View>
      ) : (
        <View style={s.contentWrap}>
          {/* 上半部分：门派内容 */}
          <View style={s.scrollWrap}>
            <ScrollView
              contentContainerStyle={s.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* 门派概览卡片 */}
              <SectOverview overview={sectInfo.overview} />

              {/* 快捷操作（置顶方便玩家操作） */}
              <SectActions
                npcLocations={sectInfo.npcLocations}
                onTeleport={handleTeleport}
              />

              {/* 职位阶梯 */}
              <RankProgress
                ranks={sectInfo.overview.ranks}
                currentRank={sectInfo.overview.rank}
                contribution={sectInfo.overview.contribution}
                nextRank={sectInfo.overview.nextRank}
              />

              {/* 日常/进度 */}
              {sectInfo.progress ? (
                <SectProgress progress={sectInfo.progress} />
              ) : null}
            </ScrollView>
          </View>

          {/* 下半部分：日志 */}
          <View style={s.logArea}>
            <LogScrollView />
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
  emptyWrap: {
    flex: 1,
  },
  contentWrap: {
    flex: 1,
  },
  scrollWrap: {
    flex: 17,
  },
  scrollContent: {
    padding: 4,
    gap: 14,
    paddingBottom: 16,
  },
  logArea: {
    flex: 3,
    borderWidth: 1,
    borderColor: '#8B7A5A30',
    borderTopWidth: 0,
    backgroundColor: '#F5F0E820',
  },
});
