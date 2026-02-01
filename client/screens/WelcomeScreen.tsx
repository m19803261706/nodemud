/**
 * 欢迎页面
 *
 * 应用启动时显示的欢迎界面，包含：
 * - 应用标题 "NodeMUD"
 * - 版本号显示
 * - 应用描述信息
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { APP_VERSION } from '../utils/constants';

const WelcomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* 应用标题 */}
      <Text style={styles.title}>NodeMUD</Text>

      {/* 版本号 */}
      <Text style={styles.version}>v{APP_VERSION}</Text>

      {/* 应用描述 */}
      <Text style={styles.description}>
        现代化文本 MUD 游戏{'\n'}基于 Node.js + TypeScript + React Native
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // 容器：深色背景，内容垂直居中
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // 标题：大字号、白色、粗体
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  // 版本号：中等字号、灰色
  version: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 32,
  },
  // 描述：中等字号、灰色、文本居中
  description: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default WelcomeScreen;
