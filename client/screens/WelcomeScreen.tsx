/**
 * 欢迎页面
 * 应用启动时显示的欢迎界面，展示标题、版本号和描述
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { APP_VERSION } from '../utils/constants';

function WelcomeScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>NodeMUD</Text>
      <Text style={styles.version}>v{APP_VERSION}</Text>
      <Text style={styles.description}>
        现代化文本 MUD 游戏{'\n'}基于 Node.js + TypeScript + React Native
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  version: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default WelcomeScreen;
