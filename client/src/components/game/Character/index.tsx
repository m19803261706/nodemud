/**
 * CharacterPage -- 人物信息页
 * 展示人物身份、成长与六维属性
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  StyleSheet,
} from 'react-native';
import { MessageFactory } from '@packages/core';
import { wsService } from '../../../services/WebSocketService';
import { useGameStore, type ResourceValue } from '../../../stores/useGameStore';
import { GradientDivider, StatBar } from '../shared';

const ATTR_CONFIG = [
  {
    key: 'wisdom',
    label: '慧根',
    brief: '悟道之资',
    detail: '影响修炼速度、秘籍领悟与心法理解。慧根越高，悟性越快。',
  },
  {
    key: 'perception',
    label: '心眼',
    brief: '洞察之明',
    detail: '影响命中、闪避与对招式的预判。心眼越高，临阵越稳。',
  },
  {
    key: 'spirit',
    label: '气海',
    brief: '内力之源',
    detail: '影响内力上限与内功威力。气海越深，真气越雄。',
  },
  {
    key: 'meridian',
    label: '脉络',
    brief: '经脉之通',
    detail: '影响内力运转与回复效率。脉络越畅，行功越顺。',
  },
  {
    key: 'strength',
    label: '筋骨',
    brief: '外功之基',
    detail: '影响外功伤害与负重能力。筋骨越强，拳脚越重。',
  },
  {
    key: 'vitality',
    label: '血气',
    brief: '生机之本',
    detail: '影响生命上限与抗击打能力。血气越盛，越能硬扛。',
  },
] as const;

const GENDER_LABEL_MAP: Record<'male' | 'female', string> = {
  male: '男',
  female: '女',
};

const ORIGIN_LABEL_MAP: Record<string, string> = {
  noble: '世家子弟',
  wanderer: '江湖浪子',
  scholar: '书院学子',
  soldier: '边塞军卒',
  herbalist: '山野药童',
  beggar: '乞丐流民',
};

type AttrKey = (typeof ATTR_CONFIG)[number]['key'];

type AttrInfoItem = (typeof ATTR_CONFIG)[number];

type CharacterProfileExt = {
  gender?: 'male' | 'female';
  origin?: string;
  sect?: {
    sectId?: string;
    sectName?: string;
    rank?: string;
    masterName?: string;
    contribution?: number;
  } | null;
};


function resourcePct(res: ResourceValue): number {
  if (res.max <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((res.current / res.max) * 100)));
}

function resourceText(res: ResourceValue): string {
  if (res.max <= 0) return '--';
  return `${res.current}/${res.max}`;
}

function toOriginLabel(origin: string): string {
  if (!origin) return '未知';
  return ORIGIN_LABEL_MAP[origin] ?? origin;
}

export const CharacterPage = () => {
  const player = useGameStore(state => state.player);
  const setActiveTab = useGameStore(state => state.setActiveTab);
  const [activeAttrInfo, setActiveAttrInfo] = useState<AttrInfoItem | null>(
    null,
  );

  const handleAllocatePoint = (key: AttrKey) => {
    if (player.freePoints <= 0) return;
    wsService.send(
      MessageFactory.create('allocatePoints', {
        allocations: { [key]: 1 },
      }),
    );
  };

  const profile = player as typeof player & CharacterProfileExt;
  const genderKey = profile.gender === 'female' ? 'female' : 'male';
  const genderLabel = GENDER_LABEL_MAP[genderKey];
  const originLabel = toOriginLabel(profile.origin ?? '');
  const sectName = profile.sect?.sectName ?? '无门无派';
  const rankName = profile.sect?.rank ?? '江湖散人';
  const masterName = profile.sect?.masterName ?? '暂无师承';
  const sectContribution = profile.sect?.contribution ?? 0;

  return (
    <View style={s.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        <View style={s.panel}>
          <View style={s.nameRow}>
            <Text style={s.nameText}>{player.name || '无名侠客'}</Text>
            <Text style={s.levelText}>
              {player.levelTitle || '初入江湖'} · Lv.{player.level}
            </Text>
          </View>

          {player.freePoints > 0 ? (
            <View style={s.freePointBadge}>
              <Text style={s.freePointText}>
                可分配属性点 {player.freePoints}
              </Text>
            </View>
          ) : null}

          <View style={s.resourceRow}>
            <StatBar
              label="气血"
              value={resourceText(player.hp)}
              pct={resourcePct(player.hp)}
              color="#A65D5D"
            />
            <StatBar
              label="内力"
              value={resourceText(player.mp)}
              pct={resourcePct(player.mp)}
              color="#4A6B6B"
            />
            <StatBar
              label="精力"
              value={resourceText(player.energy)}
              pct={resourcePct(player.energy)}
              color="#8B7355"
            />
          </View>
        </View>

        <View style={s.panel}>
          <Text style={s.sectionTitle}>人物信息</Text>
          <View style={s.infoGrid}>
            <View style={s.infoCell}>
              <Text style={s.infoLabel}>性别</Text>
              <Text style={s.infoValue}>{genderLabel}</Text>
            </View>
            <View style={s.infoCell}>
              <Text style={s.infoLabel}>出身</Text>
              <Text style={s.infoValue}>{originLabel}</Text>
            </View>
            <View style={s.infoCell}>
              <Text style={s.infoLabel}>门派</Text>
              <Text style={s.infoValue}>{sectName}</Text>
            </View>
            <View style={s.infoCell}>
              <Text style={s.infoLabel}>职位</Text>
              <Text style={s.infoValue}>{rankName}</Text>
            </View>
            <View style={s.infoCell}>
              <Text style={s.infoLabel}>师承</Text>
              <Text style={s.infoValue}>{masterName}</Text>
            </View>
            <View style={s.infoCell}>
              <Text style={s.infoLabel}>门贡</Text>
              <Text style={s.infoValue}>{sectContribution}</Text>
            </View>
          </View>
        </View>

        <View style={s.panel}>
          <Text style={s.sectionTitle}>江湖历程</Text>
          <View style={s.statGrid}>
            <View style={s.statCell}>
              <Text style={s.statLabel}>经验</Text>
              <Text style={s.statValue}>{player.exp}</Text>
            </View>
            <View style={s.statCell}>
              <Text style={s.statLabel}>距下级</Text>
              <Text style={s.statValue}>{player.expToNextLevel}</Text>
            </View>
            <View style={s.statCell}>
              <Text style={s.statLabel}>潜能</Text>
              <Text style={s.statValue}>{player.potential}</Text>
            </View>
            <View style={s.statCell}>
              <Text style={s.statLabel}>阅历</Text>
              <Text style={s.statValue}>{player.score}</Text>
            </View>
            <View style={s.statCell}>
              <Text style={s.statLabel}>银两</Text>
              <Text style={s.statValue}>{player.silver}</Text>
            </View>
            <View style={s.statCell}>
              <Text style={s.statLabel}>攻防</Text>
              <Text style={s.statValue}>
                {player.combat.attack}/{player.combat.defense}
              </Text>
            </View>
          </View>
        </View>

        <View style={s.panel}>
          <Text style={s.sectionTitle}>六维属性</Text>
          {player.freePoints > 0 ? (
            <Text style={s.allocateHint}>
              点击属性右侧“+”可分配 1 点（剩余 {player.freePoints} 点）
            </Text>
          ) : null}
          <Text style={s.attrGuide}>点右上角「?」查看属性用途</Text>
          <View style={s.attrGrid}>
            {ATTR_CONFIG.map(attr => {
              const base = player.attrs[attr.key];
              const bonus =
                (
                  player.equipBonus.attrs as Record<string, number> | undefined
                )?.[attr.key] ?? 0;
              return (
                <View key={attr.key} style={s.attrCell}>
                  <TouchableOpacity
                    style={s.attrInfoCorner}
                    activeOpacity={0.7}
                    onPress={() => setActiveAttrInfo(attr)}
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                  >
                    <Text style={s.attrInfoCornerText}>?</Text>
                  </TouchableOpacity>
                  <View style={s.attrTopRow}>
                    <Text style={s.attrLabel}>{attr.label}</Text>
                    {player.freePoints > 0 ? (
                      <TouchableOpacity
                        style={s.attrAllocateBtn}
                        activeOpacity={0.7}
                        onPress={() => handleAllocatePoint(attr.key)}
                      >
                        <Text style={s.attrAllocateBtnText}>+</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  <View style={s.attrValueRow}>
                    <Text style={s.attrValue}>{base}</Text>
                    {bonus > 0 ? (
                      <Text style={s.attrBonus}>+{bonus}</Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={s.actionRow}>
          <TouchableOpacity
            style={s.actionBtn}
            activeOpacity={0.7}
            onPress={() => setActiveTab('背包')}
          >
            <Text style={s.actionBtnText}>前往背包</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.actionBtn}
            activeOpacity={0.7}
            onPress={() => setActiveTab('江湖')}
          >
            <Text style={s.actionBtnText}>返回江湖</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <GradientDivider opacity={0.3} />

      <Modal
        visible={!!activeAttrInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveAttrInfo(null)}
      >
        <TouchableWithoutFeedback onPress={() => setActiveAttrInfo(null)}>
          <View style={s.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={s.modalCard}>
                <View style={s.modalHeaderRow}>
                  <Text style={s.modalTitle}>{activeAttrInfo?.label}</Text>
                  <TouchableOpacity
                    style={s.modalCloseBtn}
                    onPress={() => setActiveAttrInfo(null)}
                    activeOpacity={0.7}
                  >
                    <Text style={s.modalCloseBtnText}>×</Text>
                  </TouchableOpacity>
                </View>
                <Text style={s.modalBrief}>{activeAttrInfo?.brief}</Text>
                <Text style={s.modalDetail}>{activeAttrInfo?.detail}</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#8B7A5A30',
    backgroundColor: '#F5F0E830',
  },
  content: {
    padding: 10,
    gap: 10,
  },
  panel: {
    borderWidth: 1,
    borderColor: '#8B7A5A25',
    backgroundColor: '#F5F0E850',
    padding: 10,
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  nameText: {
    fontSize: 16,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    fontWeight: '700',
  },
  levelText: {
    fontSize: 12,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    fontWeight: '600',
  },
  freePointBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#A43A3A60',
    backgroundColor: '#A43A3A18',
  },
  freePointText: {
    fontSize: 11,
    color: '#A43A3A',
    fontFamily: 'Noto Serif SC',
    fontWeight: '600',
  },
  resourceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    fontWeight: '700',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
    columnGap: 8,
  },
  infoCell: {
    width: '31%',
    minWidth: 88,
    borderWidth: 1,
    borderColor: '#8B7A5A25',
    backgroundColor: '#F5F0E880',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  infoLabel: {
    fontSize: 10,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  infoValue: {
    fontSize: 12,
    color: '#3A3530',
    fontFamily: 'Noto Sans SC',
    fontWeight: '700',
    marginTop: 2,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
    columnGap: 8,
  },
  statCell: {
    width: '31%',
    minWidth: 88,
    borderWidth: 1,
    borderColor: '#8B7A5A25',
    backgroundColor: '#F5F0E880',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  statLabel: {
    fontSize: 10,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  statValue: {
    fontSize: 12,
    color: '#3A3530',
    fontFamily: 'Noto Sans SC',
    fontWeight: '700',
    marginTop: 2,
  },
  attrGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
    columnGap: 8,
  },
  attrCell: {
    width: '31%',
    minWidth: 88,
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#8B7A5A20',
    backgroundColor: '#F5F0E870',
    position: 'relative',
  },
  attrTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  attrLabel: {
    fontSize: 10,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  allocateHint: {
    fontSize: 10,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    marginTop: -2,
  },
  attrGuide: {
    fontSize: 10,
    color: '#7A6A56',
    fontFamily: 'Noto Serif SC',
    marginTop: -4,
    marginBottom: 2,
  },
  attrInfoCorner: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#8B7A5A90',
    backgroundColor: '#F5F0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attrInfoCornerText: {
    fontSize: 10,
    lineHeight: 10,
    color: '#6B5D4D',
    fontFamily: 'Noto Sans SC',
    fontWeight: '700',
  },
  attrAllocateBtn: {
    width: 18,
    height: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#8B7A5A70',
    backgroundColor: '#F5F0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attrAllocateBtnText: {
    fontSize: 13,
    lineHeight: 13,
    color: '#6B5D4D',
    fontFamily: 'Noto Sans SC',
    fontWeight: '700',
  },
  attrValueRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  attrValue: {
    fontSize: 13,
    color: '#3A3530',
    fontFamily: 'Noto Sans SC',
    fontWeight: '700',
  },
  attrBonus: {
    fontSize: 10,
    color: '#2F7A3F',
    fontFamily: 'Noto Sans SC',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#8B7A5A55',
    backgroundColor: '#F5F0E8',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 15,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    fontWeight: '700',
  },
  modalCloseBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    fontSize: 18,
    color: '#8B7A5A',
    lineHeight: 18,
  },
  modalBrief: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  modalDetail: {
    fontSize: 12,
    color: '#5A5048',
    lineHeight: 18,
    fontFamily: 'Noto Serif SC',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    height: 34,
    borderWidth: 1,
    borderColor: '#8B7A5A50',
    backgroundColor: '#F5F0E880',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 12,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    fontWeight: '600',
  },
});
