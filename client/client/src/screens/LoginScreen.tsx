/**
 * 登录页面 - 水墨风
 * 完全复刻 Pencil 设计稿（l3i03）
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { MessageFactory } from '@packages/core';
import { wsService } from '../services/WebSocketService';

export const LoginScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // 连接 WebSocket
    wsService.connect('ws://localhost:4001').catch(error => {
      Alert.alert('连接失败', '无法连接到服务器，请检查网络');
    });

    // 监听登录响应
    wsService.on('loginSuccess', data => {
      if (data.hasCharacter) {
        navigation.navigate('GameHome', { characterId: data.characterId });
      } else {
        navigation.navigate('CreateCharacter');
      }
    });

    wsService.on('loginFailed', data => {
      Alert.alert('登录失败', data.message);
    });

    return () => {
      // 清理监听器（注意：需要传入相同的函数引用才能清理）
    };
  }, [navigation]);

  const handleLogin = () => {
    // 前端验证
    if (!username || !password) {
      Alert.alert('提示', '请填写侠名和口令');
      return;
    }

    // 发送登录消息
    wsService.send(MessageFactory.create('login', username, password));
  };

  return (
    <LinearGradient
      colors={['#F5F0E8', '#EBE5DA', '#E0D9CC', '#D5CEC0']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* 顶部装饰 */}
          <View style={styles.topDecoration} />

          {/* 标题区域 */}
          <View style={styles.titleArea}>
            <Text style={styles.mainTitle}>人在江湖</Text>
            <Text style={styles.subtitle}>—— 踏入武林，书写传奇 ——</Text>
          </View>

          {/* 表单区域 */}
          <View style={styles.formArea}>
            {/* 用户名输入框 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>侠名</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="请输入侠名..."
                  placeholderTextColor="#8B7A5A80"
                  value={username}
                  onChangeText={setUsername}
                />
              </View>
            </View>

            {/* 密码输入框 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>口令</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="请输入口令..."
                  placeholderTextColor="#8B7A5A80"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {/* 选项行 */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberMe}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxChecked,
                  ]}
                />
                <Text style={styles.rememberText}>记住我</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.forgetLink}>忘记口令？</Text>
              </TouchableOpacity>
            </View>

            {/* 登录按钮 */}
            <TouchableOpacity onPress={handleLogin}>
              <LinearGradient
                colors={['#D5CEC0', '#C9C2B4', '#B8B0A0']}
                style={styles.loginButton}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
              >
                <Text style={styles.loginButtonText}>踏入江湖</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* 分隔线 */}
            <View style={styles.divider}>
              <LinearGradient
                colors={['#8B7A5A00', '#8B7A5A40']}
                style={styles.dividerLine}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
              />
              <Text style={styles.dividerText}>或</Text>
              <LinearGradient
                colors={['#8B7A5A40', '#8B7A5A00']}
                style={styles.dividerLine}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
              />
            </View>

            {/* 第三方登录 */}
            <View style={styles.thirdPartyLogin}>
              <TouchableOpacity style={styles.thirdPartyButton}>
                <Text style={styles.thirdPartyText}>微</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.thirdPartyButton}>
                <Text style={styles.thirdPartyText}>🍎</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.spacer} />

            {/* 注册提示 */}
            <View style={styles.registerHint}>
              <Text style={styles.hintText}>初入江湖？</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>创建侠号</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 底部装饰 */}
          <View style={styles.bottomDecoration}>
            <Text style={styles.footerText}>仗剑天涯 · 快意恩仇</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topDecoration: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#8B7A5A40',
  },
  titleArea: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    gap: 12,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#3A3530',
    letterSpacing: 8,
    fontFamily: 'Noto Serif SC',
  },
  subtitle: {
    fontSize: 14,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  formArea: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 20,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  inputWrapper: {
    height: 48,
    backgroundColor: '#F5F0E830',
    borderWidth: 1,
    borderColor: '#8B7A5A40',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  input: {
    fontSize: 14,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#8B7A5A60',
  },
  checkboxChecked: {
    backgroundColor: '#8B7A5A60',
  },
  rememberText: {
    fontSize: 12,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  forgetLink: {
    fontSize: 12,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  loginButton: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B7A5A80',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A3530',
    letterSpacing: 4,
    fontFamily: 'Noto Serif SC',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  thirdPartyLogin: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  thirdPartyButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F0E850',
    borderWidth: 1,
    borderColor: '#8B7A5A30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thirdPartyText: {
    fontSize: 20,
  },
  spacer: {
    flex: 1,
  },
  registerHint: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  hintText: {
    fontSize: 13,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  bottomDecoration: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#8B7A5A40',
  },
  footerText: {
    fontSize: 12,
    color: '#8B7A5A60',
    letterSpacing: 2,
    fontFamily: 'Noto Serif SC',
  },
});
