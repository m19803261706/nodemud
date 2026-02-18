/**
 * RankProgress -- 职位阶梯可视化
 * 横向步进条，展示门派全部职位阶梯，高亮当前及已达到的节点
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { SectRankInfo } from '@packages/core';

interface RankProgressProps {
  ranks: SectRankInfo[];
  currentRank: string;
  contribution: number;
  nextRank: SectRankInfo | null;
}

export const RankProgress = ({
  ranks,
  currentRank,
}: RankProgressProps) => {
  if (ranks.length === 0) return null;

  const currentIndex = ranks.findIndex(r => r.rank === currentRank);

  return (
    <View style={s.container}>
      <Text style={s.sectionTitle}>职位阶梯</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {ranks.map((rankInfo, index) => {
          const isReached = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <View key={rankInfo.rank} style={s.nodeGroup}>
              {/* 连线（非第一个节点前有连线） */}
              {index > 0 ? (
                <View
                  style={[
                    s.connector,
                    isReached ? s.connectorActive : undefined,
                  ]}
                />
              ) : null}
              {/* 节点圆点 */}
              <View
                style={[
                  s.dot,
                  isReached ? s.dotActive : undefined,
                  isCurrent ? s.dotCurrent : undefined,
                ]}
              />
              {/* 职位名称 */}
              <Text
                style={[
                  s.rankLabel,
                  isReached ? s.rankLabelActive : undefined,
                  isCurrent ? s.rankLabelCurrent : undefined,
                ]}
              >
                {rankInfo.rank}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    paddingHorizontal: 4,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  nodeGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    position: 'relative',
  },
  connector: {
    width: 24,
    height: 2,
    backgroundColor: '#D5D0C8',
    marginRight: -1,
  },
  connectorActive: {
    backgroundColor: '#8B7A5A',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D5D0C8',
    zIndex: 1,
  },
  dotActive: {
    backgroundColor: '#8B7A5A',
  },
  dotCurrent: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#6B5A3A',
  },
  rankLabel: {
    position: 'absolute',
    top: 18,
    fontSize: 10,
    color: '#A09888',
    fontFamily: 'Noto Serif SC',
    textAlign: 'center',
    width: 48,
    left: -19,
  },
  rankLabelActive: {
    color: '#6B5D4D',
  },
  rankLabelCurrent: {
    fontWeight: '700',
    color: '#3A3530',
  },
});
