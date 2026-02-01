/**
 * 创建角色页面（占位符）
 * 登录后无角色或注册成功后显示
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export const CreateCharacterScreen = () => {
  return (
    <LinearGradient
      colors={['#F5F0E8', '#EBE5DA', '#E0D9CC', '#D5CEC0']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <View style={styles.content}>
        <Text style={styles.title}>创建角色</Text>
        <Text style={styles.subtitle}>创建角色页面（占位符）</Text>
        <Text style={styles.hint}>
          后续版本将展示：{'\n'}
          - 角色名称输入{'\n'}
          - 属性分配{'\n'}
          - 背景故事选择{'\n'}
          - 确认预览
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
  hint: {
    fontSize: 13,
    color: '#8B7A5A',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Noto Serif SC',
    marginTop: 20,
  },
});
