/**
 * 游戏主页（占位符）
 * 登录后有角色时显示
 * 集成 RichText 组件展示富文本渲染效果
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { RichText } from '../components';

/** 富文本演示数据 — 模拟 look 指令输出 */
const DEMO_RICH_TEXT = [
  '[rn][b]裂隙镇 · 中央广场[/b][/rn]',
  '[rd]青石板铺就的广场中央矗立着一座古朴的石碑，碑上刻满了斑驳的文字。四周商铺林立，人来人往，偶尔传来几声吆喝。微风拂过，带来远处酒楼飘出的菜香。[/rd]',
  '',
  '[sys]这里的出口有: [/sys][exit]东[/exit][sys], [/sys][exit]西[/exit][sys], [/sys][exit]南[/exit][sys], [/sys][exit]北[/exit]',
  '',
  '[sys]这里有: [/sys][npc]老镇长[/npc][sys], [/sys][npc]铁匠王五[/npc]',
  '[sys]地上有: [/sys][item]生锈的铁剑[/item][sys], [/sys][item]包子[/item]',
  '',
  '[player]少侠[/player][sys]说道: 「[/sys][chat]有人知道怎么去藏剑山庄吗？[/chat][sys]」[/sys]',
  '[sys]你向[/sys][exit]东[/exit][sys]走去。[/sys]',
  '[combat]野狼扑了过来！[/combat]',
  '[damage]你受到 [b]128[/b] 点伤害[/damage]',
  '[heal]你恢复了 [b]64[/b] 点生命[/heal]',
  '[imp]警告：你的生命值过低！[/imp]',
];

export const GameHomeScreen = ({ route }: any) => {
  const { characterId } = route.params || {};

  return (
    <LinearGradient
      colors={['#F5F0E8', '#EBE5DA', '#E0D9CC', '#D5CEC0']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>欢迎回来，大侠</Text>
        {characterId && <Text style={styles.info}>角色 ID: {characterId}</Text>}
      </View>

      {/* 消息日志区域 — 富文本演示 */}
      <ScrollView style={styles.messageLog} contentContainerStyle={styles.messageLogContent}>
        {DEMO_RICH_TEXT.map((line, i) =>
          line === '' ? (
            <View key={i} style={styles.emptyLine} />
          ) : (
            <RichText key={i} text={line} theme="light" style={styles.richText} />
          ),
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.hint}>富文本渲染演示 · 后续版本将接入实时指令</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3A3530',
    letterSpacing: 6,
    fontFamily: 'Noto Serif SC',
  },
  info: {
    fontSize: 13,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  messageLog: {
    flex: 1,
    marginHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#C5BEB0',
  },
  messageLogContent: {
    padding: 16,
  },
  richText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  emptyLine: {
    height: 8,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  hint: {
    fontSize: 12,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
});
