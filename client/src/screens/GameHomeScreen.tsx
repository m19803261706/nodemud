/**
 * 游戏主页 — 1:1 复刻 Pencil 设计稿
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

/* ─── Mock 数据（与设计稿一致）─── */

const PLAYER_STATS = {
  name: '剑心侠客',
  level: '五十八级',
  row1: [
    { label: '气血', value: '1280/1500', pct: 85, color: '#A65D5D' },
    { label: '内力', value: '850/1000', pct: 85, color: '#4A6B6B' },
    { label: '经验', value: '78%', pct: 78, color: '#8B7355' },
  ],
  row2: [
    { label: '潜能', value: '2450', pct: 60, color: '#6B8A5A' },
    { label: '技能', value: '32/50', pct: 64, color: '#5A6B8A' },
    { label: '银两', value: '12,580', pct: 45, color: '#8B7A14' },
  ],
};

const LOCATION_BUTTONS = ['回城', '飞行', '地图', '邮件'];

const GAME_LOG = [
  { text: '你从梅道来到了冰道。', color: '#3D3935' },
  { text: '此处乃凌霄城之冰道，寒气逼人，四周结满冰霜。', color: '#5A5550' },
  { text: '凌霄弟子道：「施主远道而来，不知有何贵干？」', color: '#2B5A3A' },
  { text: '【系统】你获得了一百经验值。', color: '#8B6B14' },
  { text: '【战斗】凌霄弟子对你发动攻击！', color: '#8B3A3A' },
  { text: '你施展「太极剑法」反击，造成二百三十伤害。', color: '#3A5A6B' },
  { text: '【闲聊】逍遥剑客：有人组队下副本吗？', color: '#6B5A8B' },
  { text: '凌霄弟子倒地不起，你获得了胜利。', color: '#3D3935' },
  { text: '【门派】掌门人：今晚八点举行门派会议。', color: '#5A4A3A' },
  { text: '你从凌霄弟子身上搜出纹银三十两。', color: '#7A6A14' },
];

const ACTION_BUTTONS = ['拜师', '领取任务', '打坐'];

const CHAT_MESSAGES = [
  { text: '【闲聊】逍遥剑客：有人组队下副本吗？', color: '#6B5A8B' },
  { text: '【闲聊】冰心仙子：我来！等等我~', color: '#6B5A8B' },
  { text: '【门派】掌门人：今晚八点举行门派大会', color: '#5A4A3A' },
  { text: '【世界】醉仙翁：收购天山雪莲，高价！', color: '#8B6B14' },
];

const DIRECTIONS = [
  [
    { text: '西北', bold: false },
    { text: '北', bold: true },
    { text: '东北', bold: false },
  ],
  [
    { text: '西', bold: true },
    { text: '中', bold: true, center: true },
    { text: '东', bold: true },
  ],
  [
    { text: '西南', bold: false },
    { text: '南', bold: true },
    { text: '东南', bold: false },
  ],
];

const NPC_LIST = [
  {
    name: '凌霄弟子',
    nameColor: '#2F5D3A',
    gender: '♂',
    genderColor: '#4A7A5A',
    level: '四十六级',
    hpPct: 70,
    hpColor: '#5A8A6A',
    borderColor: '#2F5D3A40',
  },
  {
    name: '冰心仙子',
    nameColor: '#2F5D3A',
    gender: '♀',
    genderColor: '#8A5A7A',
    level: '五十二级',
    hpPct: 100,
    hpColor: '#5A8A6A',
    borderColor: '#2F5D3A40',
  },
  {
    name: '逍遥剑客',
    nameColor: '#3A5A6B',
    gender: '♂',
    genderColor: '#5A7A8B',
    level: '三十八级',
    hpPct: 60,
    hpColor: '#6A8A9A',
    borderColor: '#2F4F4F40',
  },
  {
    name: '云游僧',
    nameColor: '#3A5A6B',
    gender: '♂',
    genderColor: '#5A7A8B',
    level: '四十五级',
    hpPct: 50,
    hpColor: '#6A8A9A',
    borderColor: '#2F4F4F40',
  },
  {
    name: '醉仙翁',
    nameColor: '#3A5A6B',
    gender: '♂',
    genderColor: '#5A7A8B',
    level: '九十九级',
    hpPct: 100,
    hpColor: '#6A8A9A',
    borderColor: '#2F4F4F40',
  },
];

const NAV_TABS = [
  { label: '人物', active: false },
  { label: '技能', active: false },
  { label: '江湖', active: true },
  { label: '门派', active: false },
  { label: '背包', active: false },
];

/* ─── 子组件 ─── */

/** 属性条：标签+数值 横向排列，下方 4px 进度条 */
const StatBar = ({
  label,
  value,
  pct,
  color,
}: {
  label: string;
  value: string;
  pct: number;
  color: string;
}) => (
  <View style={s.statBox}>
    <View style={s.statHeader}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={[s.statValue, { color }]}>{value}</Text>
    </View>
    <View style={s.statBarBg}>
      <View
        style={[s.statBarFill, { width: `${pct}%`, backgroundColor: color }]}
      />
    </View>
  </View>
);

/** 渐变分隔线（通过底部 stroke 实现，这里用 LinearGradient 模拟） */
const GradientBorder = ({ opacity = 0.38 }: { opacity?: number }) => (
  <LinearGradient
    colors={['transparent', `rgba(139,122,90,${opacity})`, 'transparent']}
    start={{ x: 0, y: 0.5 }}
    end={{ x: 1, y: 0.5 }}
    style={s.gradientBorder}
  />
);

/* ─── 主组件 ─── */

export const GameHomeScreen = ({ route }: any) => {
  return (
    <LinearGradient
      colors={['#F5F0E8', '#EBE5DA', '#E0D9CC', '#D5CEC0']}
      locations={[0, 0.3, 0.6, 1]}
      style={s.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={s.safeArea}>
        {/* ── 1. Player Stats 顶部状态栏 ── */}
        <View style={s.playerStats}>
          {/* 名称行：左名字 右等级 */}
          <View style={s.nameRow}>
            <Text style={s.playerName}>{PLAYER_STATS.name}</Text>
            <View style={s.levelBadge}>
              <Text style={s.levelText}>{PLAYER_STATS.level}</Text>
            </View>
          </View>
          {/* Row1 */}
          <View style={s.statsRow}>
            {PLAYER_STATS.row1.map(stat => (
              <StatBar key={stat.label} {...stat} />
            ))}
          </View>
          {/* Row2 */}
          <View style={s.statsRow}>
            {PLAYER_STATS.row2.map(stat => (
              <StatBar key={stat.label} {...stat} />
            ))}
          </View>
          <GradientBorder opacity={0.38} />
        </View>

        {/* ── 2. Location Header 地点标题 ── */}
        <View style={s.locationHeader}>
          <View style={s.locationRow}>
            <Text style={s.locationName}>冰 道</Text>
            <View style={s.locationBtns}>
              {LOCATION_BUTTONS.map(label => (
                <TouchableOpacity key={label} style={s.locBtn}>
                  <Text style={s.locBtnText}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <GradientBorder opacity={0.25} />
        </View>

        {/* ── 3. Main Content Area 主内容区 ── */}
        <View style={s.mainContent}>
          {/* 左侧区域 */}
          <View style={s.leftPanel}>
            {/* Game Log */}
            <View style={s.gameLog}>
              <ScrollView
                style={s.logScroll}
                contentContainerStyle={s.logScrollContent}
              >
                {GAME_LOG.map((line, i) => (
                  <Text key={i} style={[s.logText, { color: line.color }]}>
                    {line.text}
                  </Text>
                ))}
              </ScrollView>
              {/* Action Bar */}
              <View style={s.actionBar}>
                {ACTION_BUTTONS.map(label => (
                  <TouchableOpacity key={label} style={s.actionBtn}>
                    <Text style={s.actionBtnText}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Chat Display Area */}
            <View style={s.chatArea}>
              <ScrollView
                style={s.chatScroll}
                contentContainerStyle={s.chatScrollContent}
              >
                {CHAT_MESSAGES.map((msg, i) => (
                  <Text key={i} style={[s.chatMsg, { color: msg.color }]}>
                    {msg.text}
                  </Text>
                ))}
              </ScrollView>
              {/* Chat Bottom */}
              <View style={s.chatBottom}>
                <TouchableOpacity style={s.chatBtnWrap}>
                  <LinearGradient
                    colors={['#D5CEC0', '#C9C2B4', '#B8B0A0']}
                    style={s.chatBtnGradient}
                    start={{ x: 0.5, y: 1 }}
                    end={{ x: 0.5, y: 0 }}
                  >
                    <Text style={s.chatBtnText}>聊天</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Map Navigation 3x3 */}
            <View style={s.mapNav}>
              {DIRECTIONS.map((row, ri) => (
                <View key={ri} style={s.dirRow}>
                  {row.map((dir, ci) => (
                    <TouchableOpacity
                      key={`${ri}-${ci}`}
                      style={[
                        s.dirCell,
                        dir.center && s.dirCellCenter,
                        !dir.bold && !dir.center && s.dirCellDiag,
                        dir.bold && !dir.center && s.dirCellCardinal,
                      ]}
                      disabled={dir.center}
                    >
                      <Text
                        style={[
                          s.dirText,
                          dir.bold && s.dirTextBold,
                          dir.center && s.dirTextCenter,
                          !dir.bold && s.dirTextDiag,
                        ]}
                      >
                        {dir.text}
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
              <TouchableOpacity
                key={i}
                style={[s.npcCard, { borderColor: npc.borderColor }]}
              >
                <View style={s.npcTop}>
                  <Text style={[s.npcName, { color: npc.nameColor }]}>
                    {npc.name}
                  </Text>
                  <Text style={[s.npcGender, { color: npc.genderColor }]}>
                    {npc.gender}
                  </Text>
                </View>
                <Text style={s.npcLevel}>{npc.level}</Text>
                <View style={s.npcHpBg}>
                  <View
                    style={[
                      s.npcHpFill,
                      {
                        width: `${npc.hpPct}%` as any,
                        backgroundColor: npc.hpColor,
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── 4. Bottom Navigation 底部导航 ── */}
        <View style={s.bottomNav}>
          {NAV_TABS.map(tab =>
            tab.active ? (
              <LinearGradient
                key={tab.label}
                colors={['#D5CEC0', '#C9C2B4', '#B8B0A0']}
                style={s.navTabActive}
                start={{ x: 0.5, y: 1 }}
                end={{ x: 0.5, y: 0 }}
              >
                <Text style={s.navLabelActive}>{tab.label}</Text>
              </LinearGradient>
            ) : (
              <TouchableOpacity key={tab.label} style={s.navTab}>
                <Text style={s.navLabel}>{tab.label}</Text>
              </TouchableOpacity>
            ),
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

/* ─── 样式 ─── */

const s = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },

  /* ── Player Stats ── */
  playerStats: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 0,
    gap: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  levelBadge: {
    borderWidth: 1,
    borderColor: '#8B7A5A80',
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    gap: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  statValue: {
    fontSize: 9,
    fontFamily: 'Noto Sans SC',
  },
  statBarBg: {
    height: 4,
    backgroundColor: '#D5CEC060',
  },
  statBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  gradientBorder: {
    height: 1,
  },

  /* ── Location Header ── */
  locationHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
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
  locationBtns: {
    flexDirection: 'row',
    gap: 6,
  },
  locBtn: {
    borderWidth: 1,
    borderColor: '#8B7A5A60',
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locBtnText: {
    fontSize: 11,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },

  /* ── Main Content Area ── */
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    gap: 10,
  },
  leftPanel: {
    flex: 17,
    gap: 10,
  },

  /* Game Log */
  gameLog: {
    flex: 1,
    backgroundColor: '#F5F0E830',
    borderWidth: 1,
    borderColor: '#8B7A5A30',
    padding: 12,
  },
  logScroll: {
    flex: 1,
  },
  logScrollContent: {
    gap: 6,
  },
  logText: {
    fontSize: 12,
    lineHeight: 12 * 1.4,
    fontFamily: 'Noto Serif SC',
  },
  actionBar: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  actionBtn: {
    backgroundColor: '#E8E2D660',
    borderWidth: 1,
    borderColor: '#8B7A5A40',
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 11,
    color: '#5A5048',
    fontFamily: 'Noto Serif SC',
  },

  /* Chat Display Area */
  chatArea: {
    height: 100,
    backgroundColor: '#F5F0E830',
    borderWidth: 1,
    borderColor: '#8B7A5A30',
  },
  chatScroll: {
    flex: 1,
  },
  chatScrollContent: {
    padding: 8,
    paddingHorizontal: 10,
    gap: 4,
  },
  chatMsg: {
    fontSize: 11,
    lineHeight: 11 * 1.3,
    fontFamily: 'Noto Serif SC',
  },
  chatBottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#8B7A5A20',
  },
  chatBtnWrap: {},
  chatBtnGradient: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#8B7A5A60',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBtnText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },

  /* Map Navigation */
  mapNav: {
    height: 120,
    backgroundColor: '#F5F0E830',
    borderWidth: 1,
    borderColor: '#8B7A5A30',
    padding: 8,
    gap: 4,
  },
  dirRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  dirCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dirCellDiag: {
    backgroundColor: '#E8E2D850',
  },
  dirCellCardinal: {
    backgroundColor: '#D5CFC540',
  },
  dirCellCenter: {
    backgroundColor: '#C5BFB560',
    borderWidth: 1,
    borderColor: '#8B7A5A60',
  },
  dirText: {
    fontFamily: 'Noto Serif SC',
  },
  dirTextBold: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A5048',
  },
  dirTextCenter: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A3530',
  },
  dirTextDiag: {
    fontSize: 13,
    fontWeight: 'normal',
    color: '#8B7A5A80',
  },

  /* Right Character List */
  rightPanel: {
    flex: 7,
    backgroundColor: '#F5F0E830',
    borderWidth: 1,
    borderColor: '#8B7A5A30',
    padding: 8,
    gap: 6,
  },
  npcCard: {
    padding: 6,
    gap: 4,
    borderWidth: 1,
    marginBottom: 6,
  },
  npcTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  npcName: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Noto Serif SC',
  },
  npcGender: {
    fontSize: 10,
    fontFamily: 'Noto Sans SC',
  },
  npcLevel: {
    fontSize: 10,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  npcHpBg: {
    height: 4,
    backgroundColor: '#D5CEC060',
  },
  npcHpFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },

  /* ── Bottom Navigation ── */
  bottomNav: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#8B7A5A20',
  },
  navTab: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#8B7A5A40',
  },
  navTabActive: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#8B7A5A80',
  },
  navLabel: {
    fontSize: 12,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  navLabelActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
});
