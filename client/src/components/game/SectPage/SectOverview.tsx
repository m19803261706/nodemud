/**
 * SectOverview -- 门派概览卡片
 * 展示门派名称、当前职位、贡献进度、师父名称、入门日期
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { SectOverviewData } from '@packages/core';

interface SectOverviewProps {
  overview: SectOverviewData;
}

/** 计算"XX天前"的时间文案 */
function formatDaysAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return '今日';
  if (days === 1) return '昨日';
  return `${days}天前`;
}

export const SectOverview = ({ overview }: SectOverviewProps) => {
  const { sectName, rank, contribution, masterName, joinedAt, nextRank } =
    overview;

  // 贡献进度计算
  const isMaxRank = nextRank === null;
  const progressTarget = nextRank ? nextRank.minContribution : contribution;
  const progressPct = isMaxRank
    ? 1
    : progressTarget > 0
      ? Math.min(1, contribution / progressTarget)
      : 0;

  return (
    <View style={s.card}>
      {/* 门派名 + 职位标签 */}
      <View style={s.headerRow}>
        <Text style={s.sectName}>{sectName}</Text>
        <View style={s.rankBadge}>
          <Text style={s.rankText}>{rank}</Text>
        </View>
      </View>

      {/* 贡献进度条 */}
      <View style={s.progressSection}>
        <View style={s.progressLabelRow}>
          <Text style={s.progressLabel}>贡献</Text>
          <Text style={s.progressValue}>
            {isMaxRank
              ? `${contribution}（已达最高职位）`
              : `${contribution} / ${progressTarget}`}
          </Text>
        </View>
        <View style={s.progressBarBg}>
          <View
            style={[s.progressBarFill, { width: `${progressPct * 100}%` }]}
          />
        </View>
      </View>

      {/* 师父 + 入门日期 */}
      <View style={s.infoRow}>
        <Text style={s.infoLabel}>师父</Text>
        <Text style={s.infoValue}>{masterName}</Text>
      </View>
      <View style={s.infoRow}>
        <Text style={s.infoLabel}>入门</Text>
        <Text style={s.infoValue}>{formatDaysAgo(joinedAt)}</Text>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  card: {
    backgroundColor: '#F5F0E8',
    borderWidth: 1,
    borderColor: '#8B7A5A30',
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  rankBadge: {
    backgroundColor: '#8B7A5A20',
    borderWidth: 1,
    borderColor: '#8B7A5A40',
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  rankText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  progressSection: {
    gap: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 11,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D5D0C8',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#8B7A5A',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    fontWeight: '600',
    width: 36,
  },
  infoValue: {
    fontSize: 12,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
});
