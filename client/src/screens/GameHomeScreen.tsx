/**
 * 游戏主页 — 1:1 复刻设计稿
 * 5 个区域：顶部状态栏 / 地点标题 / 主内容区 / 底部导航
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

/* ─── Mock 数据 ─── */

/** 玩家状态栏数据 */
const PLAYER_STATS = {
  name: '剑心侠客',
  level: '五十八级',
  row1: [
    { label: '气血', current: 3280, max: 5000, color: '#A65D5D' },
    { label: '内力', current: 1850, max: 3000, color: '#4A6B6B' },
    { label: '经验', current: 45600, max: 100000, color: '#8B7355' },
  ],
  row2: [
    { label: '潜能', current: 2400, max: 5000, color: '#6B8A5A' },
    { label: '技能', current: 780, max: 1000, color: '#5A6B8A' },
    { label: '银两', current: 12800, max: 99999, color: '#8B7A14' },
  ],
};

/** 地点信息 */
const LOCATION = {
  name: '冰　道',
  actions: [
    { label: '回城', icon: 'home' },
    { label: '飞行', icon: 'send' },
    { label: '地图', icon: 'map' },
    { label: '邮件', icon: 'mail' },
  ],
};

/** 游戏日志 */
const GAME_LOG = [
  { text: '你向北走去...', color: '#6B5D4D' },
  { text: '冰道 - 寒风刺骨的小路', color: '#3A3530' },
  { text: '地上铺满了厚厚的积雪，两旁古木参天。', color: '#6B5D4D' },
  { text: '远处传来狼嚎声，令人不寒而栗。', color: '#8B7355' },
  { text: '你发现了一个 生锈的铁剑', color: '#5A6B8A' },
  { text: '寒冰巨狼 扑了过来！', color: '#A65D5D' },
  { text: '你使用「落雁剑法」攻击寒冰巨狼', color: '#4A6B6B' },
  { text: '对寒冰巨狼造成 256 点伤害', color: '#A65D5D' },
  { text: '寒冰巨狼被击败了！', color: '#6B8A5A' },
  { text: '你获得 1200 经验，50 银两', color: '#8B7A14' },
];

/** 聊天消息 */
const CHAT_MESSAGES = [
  { sender: '逍遥子', text: '有人组队刷副本吗', color: '#4A6B6B' },
  { sender: '醉剑仙', text: '收购寒铁矿石 500一个', color: '#8B7A14' },
  { sender: '小龙女', text: '新手求带 QAQ', color: '#A65D5D' },
  { sender: '系统', text: '【世界】玄冰宫活动即将开始', color: '#5A6B8A' },
];

/** 方向导航 */
const DIRECTIONS = [
  ['西北', '北', '东北'],
  ['西', '', '东'],
  ['西南', '南', '东南'],
];

/** 右侧角色列表 */
const NPC_LIST = [
  { name: '寒冰卫士', gender: '♂', level: 62, hp: 0.85 },
  { name: '冰原猎手', gender: '♀', level: 55, hp: 0.6 },
  { name: '雪域商人', gender: '♂', level: 40, hp: 1.0 },
  { name: '流浪剑客', gender: '♂', level: 58, hp: 0.45 },
  { name: '冰灵狐', gender: '♀', level: 35, hp: 0.7 },
];

/** 底部导航 */
const NAV_TABS = [
  { label: '人物', icon: 'user' },
  { label: '技能', icon: 'zap' },
  { label: '江湖', icon: 'compass', active: true },
  { label: '门派', icon: 'shield' },
  { label: '背包', icon: 'package' },
];

/** 操作按钮 */
const ACTION_BUTTONS = ['拜师', '领取任务', '打坐'];

/* ─── 子组件 ─── */

/** 进度条 */
const StatBar = ({
  label,
  current,
  max,
  color,
}: {
  label: string;
  current: number;
  max: number;
  color: string;
}) => {
  const pct = Math.min(current / max, 1);
  return (
    <View style={s.statBarWrap}>
      <Text style={s.statLabel}>{label}</Text>
      <View style={s.statBarOuter}>
        <View style={[s.statBarInner, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={s.statValue}>
        {current}/{max}
      </Text>
    </View>
  );
};

/** 渐变分隔线 */
const Divider = () => (
  <LinearGradient
    colors={['transparent', '#B5A88A', 'transparent']}
    start={{ x: 0, y: 0.5 }}
    end={{ x: 1, y: 0.5 }}
    style={s.divider}
  />
);

/* ─── 主组件 ─── */

export const GameHomeScreen = ({ route }: any) => {
  return (
    <LinearGradient
      colors={['#F5F0E8', '#EBE5DA', '#E0D9CC', '#D5CEC0']}
      style={s.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={s.safeArea}>
        {/* ── 1. 顶部状态栏 ── */}
        <View style={s.playerStats}>
          {/* 名称行 */}
          <View style={s.nameRow}>
            <Text style={s.playerName}>{PLAYER_STATS.name}</Text>
            <View style={s.levelBadge}>
              <Text style={s.levelText}>{PLAYER_STATS.level}</Text>
            </View>
          </View>
          {/* Row1: 气血/内力/经验 */}
          <View style={s.statsRow}>
            {PLAYER_STATS.row1.map((stat) => (
              <StatBar key={stat.label} {...stat} />
            ))}
          </View>
          {/* Row2: 潜能/技能/银两 */}
          <View style={s.statsRow}>
            {PLAYER_STATS.row2.map((stat) => (
              <StatBar key={stat.label} {...stat} />
            ))}
          </View>
          <Divider />
        </View>

        {/* ── 2. 地点标题 ── */}
        <View style={s.locationHeader}>
          <View style={s.locationRow}>
            <Text style={s.locationName}>{LOCATION.name}</Text>
            <View style={s.locationActions}>
              {LOCATION.actions.map((a) => (
                <TouchableOpacity key={a.label} style={s.locationBtn}>
                  <Icon name={a.icon} size={14} color="#6B5D4D" />
                  <Text style={s.locationBtnText}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <Divider />
        </View>

        {/* ── 3. 主内容区 ── */}
        <View style={s.mainContent}>
          {/* 左侧区域 */}
          <View style={s.leftPanel}>
            {/* 游戏日志 */}
            <ScrollView style={s.gameLog} contentContainerStyle={s.gameLogContent}>
              {GAME_LOG.map((line, i) => (
                <Text key={i} style={[s.logText, { color: line.color }]}>
                  {line.text}
                </Text>
              ))}
            </ScrollView>

            {/* Action Bar */}
            <View style={s.actionBar}>
              {ACTION_BUTTONS.map((btn) => (
                <TouchableOpacity key={btn} style={s.actionBtn}>
                  <Text style={s.actionBtnText}>{btn}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 聊天区 */}
            <View style={s.chatArea}>
              <ScrollView style={s.chatScroll}>
                {CHAT_MESSAGES.map((msg, i) => (
                  <Text key={i} style={s.chatMsg}>
                    <Text style={[s.chatSender, { color: msg.color }]}>{msg.sender}</Text>
                    <Text style={s.chatText}>: {msg.text}</Text>
                  </Text>
                ))}
              </ScrollView>
              <TouchableOpacity style={s.chatBtn}>
                <Text style={s.chatBtnText}>聊天</Text>
              </TouchableOpacity>
            </View>

            {/* 方向导航 3x3 */}
            <View style={s.mapNav}>
              {DIRECTIONS.map((row, ri) => (
                <View key={ri} style={s.dirRow}>
                  {row.map((dir, ci) => (
                    <TouchableOpacity
                      key={`${ri}-${ci}`}
                      style={[s.dirCell, dir === '' && s.dirCellCenter]}
                      disabled={dir === ''}
                    >
                      <Text style={[s.dirText, dir === '' && s.dirTextCenter]}>
                        {dir || '●'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          </View>

          {/* 右侧角色列表 */}
          <ScrollView style={s.rightPanel}>
            {NPC_LIST.map((npc, i) => (
              <TouchableOpacity key={i} style={s.npcCard}>
                <View style={s.npcInfo}>
                  <Text style={s.npcName} numberOfLines={1}>
                    {npc.name}
                  </Text>
                  <Text style={s.npcMeta}>
                    {npc.gender} Lv.{npc.level}
                  </Text>
                </View>
                <View style={s.npcHpBar}>
                  <View
                    style={[
                      s.npcHpFill,
                      {
                        width: `${npc.hp * 100}%`,
                        backgroundColor: npc.hp > 0.5 ? '#6B8A5A' : '#A65D5D',
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── 4. 底部导航 ── */}
        <View style={s.bottomNav}>
          {NAV_TABS.map((tab) => (
            <TouchableOpacity key={tab.label} style={s.navTab}>
              <Icon
                name={tab.icon}
                size={20}
                color={tab.active ? '#3A3530' : '#8B7A5A'}
              />
              <Text style={[s.navLabel, tab.active && s.navLabelActive]}>
                {tab.label}
              </Text>
              {tab.active && <View style={s.navIndicator} />}
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

/* ─── 样式 ─── */

const s = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },

  /* ── 顶部状态栏 ── */
  playerStats: { paddingHorizontal: 12, paddingTop: 4 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 2,
  },
  levelBadge: {
    backgroundColor: '#8B7A5A',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  levelText: {
    fontSize: 10,
    color: '#F5F0E8',
    fontFamily: 'Noto Sans SC',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  statBarWrap: { flex: 1 },
  statLabel: {
    fontSize: 10,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    marginBottom: 2,
  },
  statBarOuter: {
    height: 10,
    backgroundColor: '#D5CEC060',
    borderRadius: 0,
    overflow: 'hidden',
  },
  statBarInner: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 0,
  },
  statValue: {
    fontSize: 9,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
    textAlign: 'right',
    marginTop: 1,
  },
  divider: { height: 1, marginVertical: 6 },

  /* ── 地点标题 ── */
  locationHeader: { paddingHorizontal: 12 },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 8,
  },
  locationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  locationBtn: {
    alignItems: 'center',
    gap: 2,
  },
  locationBtnText: {
    fontSize: 10,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },

  /* ── 主内容区 ── */
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
    gap: 6,
  },
  leftPanel: { flex: 1 },

  /* 游戏日志 */
  gameLog: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#C5BEB0',
  },
  gameLogContent: { padding: 8 },
  logText: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'Noto Serif SC',
  },

  /* Action Bar */
  actionBar: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 4,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: 'rgba(139,122,90,0.15)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#B5A88A',
    paddingVertical: 6,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 12,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },

  /* 聊天区 */
  chatArea: {
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#C5BEB0',
    flexDirection: 'row',
  },
  chatScroll: { flex: 1, padding: 6 },
  chatMsg: { fontSize: 12, lineHeight: 18, fontFamily: 'Noto Serif SC' },
  chatSender: { fontWeight: '600' },
  chatText: { color: '#6B5D4D' },
  chatBtn: {
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: '#C5BEB0',
  },
  chatBtnText: {
    fontSize: 11,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    writingDirection: 'ltr',
  },

  /* 方向导航 */
  mapNav: {
    height: 120,
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#C5BEB0',
    padding: 4,
    justifyContent: 'center',
  },
  dirRow: {
    flexDirection: 'row',
    flex: 1,
    gap: 4,
  },
  dirCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(139,122,90,0.1)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#C5BEB080',
  },
  dirCellCenter: {
    backgroundColor: 'rgba(139,122,90,0.2)',
  },
  dirText: {
    fontSize: 13,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    fontWeight: '600',
  },
  dirTextCenter: {
    fontSize: 10,
    color: '#8B7A5A',
  },

  /* 右侧角色列表 */
  rightPanel: {
    width: 105,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#C5BEB0',
  },
  npcCard: {
    padding: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C5BEB080',
  },
  npcInfo: { marginBottom: 4 },
  npcName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  npcMeta: {
    fontSize: 9,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
    marginTop: 1,
  },
  npcHpBar: {
    height: 4,
    backgroundColor: '#D5CEC060',
    overflow: 'hidden',
  },
  npcHpFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },

  /* ── 底部导航 ── */
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C5BEB0',
    backgroundColor: 'rgba(245,240,232,0.9)',
    paddingBottom: 2,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 10,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#3A3530',
    fontWeight: '700',
  },
  navIndicator: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 2,
    backgroundColor: '#3A3530',
  },
});
