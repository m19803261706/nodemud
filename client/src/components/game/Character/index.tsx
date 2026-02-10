/**
 * CharacterPage -- 人物信息页
 * 展示当前角色的成长、属性与装备摘要
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useGameStore, type ResourceValue } from '../../../stores/useGameStore';
import { GradientDivider, StatBar } from '../shared';

const ATTR_CONFIG = [
  { key: 'wisdom', label: '慧根' },
  { key: 'perception', label: '心眼' },
  { key: 'spirit', label: '气海' },
  { key: 'meridian', label: '脉络' },
  { key: 'strength', label: '筋骨' },
  { key: 'vitality', label: '血气' },
] as const;

const EQUIPMENT_SLOTS = [
  { key: 'head', label: '头部' },
  { key: 'neck', label: '颈部' },
  { key: 'body', label: '躯干' },
  { key: 'hands', label: '手部' },
  { key: 'waist', label: '腰部' },
  { key: 'feet', label: '足部' },
  { key: 'weapon', label: '武器' },
  { key: 'offhand', label: '副手' },
  { key: 'finger', label: '戒指' },
  { key: 'wrist', label: '护腕' },
] as const;

function resourcePct(res: ResourceValue): number {
  if (res.max <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((res.current / res.max) * 100)));
}

function resourceText(res: ResourceValue): string {
  if (res.max <= 0) return '--';
  return `${res.current}/${res.max}`;
}

export const CharacterPage = () => {
  const player = useGameStore(state => state.player);
  const equipment = useGameStore(state => state.equipment);
  const setActiveTab = useGameStore(state => state.setActiveTab);

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
          <View style={s.attrGrid}>
            {ATTR_CONFIG.map(attr => {
              const base = player.attrs[attr.key];
              const bonus =
                (
                  player.equipBonus.attrs as Record<string, number> | undefined
                )?.[attr.key] ?? 0;
              return (
                <View key={attr.key} style={s.attrCell}>
                  <Text style={s.attrLabel}>{attr.label}</Text>
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

        <View style={s.panel}>
          <Text style={s.sectionTitle}>装备摘要</Text>
          <View style={s.equipmentList}>
            {EQUIPMENT_SLOTS.map(slot => {
              const equipped = equipment[slot.key];
              return (
                <View key={slot.key} style={s.equipmentRow}>
                  <Text style={s.equipmentLabel}>{slot.label}</Text>
                  <Text
                    style={[
                      s.equipmentValue,
                      equipped ? s.equipmentValueOn : null,
                    ]}
                  >
                    {equipped ? equipped.name : '--'}
                  </Text>
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
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#8B7A5A20',
    backgroundColor: '#F5F0E870',
  },
  attrLabel: {
    fontSize: 10,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
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
  equipmentList: {
    gap: 4,
  },
  equipmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#8B7A5A25',
  },
  equipmentLabel: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  equipmentValue: {
    fontSize: 12,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  equipmentValueOn: {
    color: '#3A3530',
    fontWeight: '600',
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
