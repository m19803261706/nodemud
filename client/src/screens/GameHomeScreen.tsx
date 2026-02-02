/**
 * 游戏主页（占位符）
 * 登录后有角色时显示
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export const GameHomeScreen = ({ route }: any) => {
  const { characterId } = route.params || {};

  return (
    <LinearGradient
      colors={['#F5F0E8', '#EBE5DA', '#E0D9CC', '#D5CEC0']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <View style={styles.content}>
        <Text style={styles.title}>欢迎回来，大侠</Text>
        <Text style={styles.subtitle}>游戏主页（占位符）</Text>
        {characterId && <Text style={styles.info}>角色 ID: {characterId}</Text>}
        <Text style={styles.hint}>
          后续版本将展示：{'\n'}- 角色状态{'\n'}- 房间描述{'\n'}- 消息日志{'\n'}
          - 指令输入
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3A3530',
    letterSpacing: 6,
    fontFamily: 'Noto Serif SC',
  },
  subtitle: {
    fontSize: 16,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  info: {
    fontSize: 13,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  hint: {
    fontSize: 13,
    color: '#8B7A5A',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Noto Serif SC',
    marginTop: 20,
  },
});
