/**
 * 登录页面 - 水墨风
 * 完全复刻 Pencil 设计稿（l3i03）
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import LinearGradient from '../components/LinearGradient';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MessageFactory } from '@packages/core';
import { wsService } from '../services/WebSocketService';
import { useUI } from '../components';

const STORAGE_KEY_USERNAME = '@renzai_username';
const STORAGE_KEY_PASSWORD = '@renzai_password';
const STORAGE_KEY_REMEMBER = '@renzai_remember';

export const LoginScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { showAlert, showToast } = useUI();

  // 页面加载时读取存储的账号密码
  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const savedRemember = await AsyncStorage.getItem(STORAGE_KEY_REMEMBER);
        if (savedRemember === 'true') {
          setRememberMe(true);
          const [savedUsername, savedPassword] = await Promise.all([
            AsyncStorage.getItem(STORAGE_KEY_USERNAME),
            AsyncStorage.getItem(STORAGE_KEY_PASSWORD),
          ]);
          if (savedUsername) setUsername(savedUsername);
          if (savedPassword) setPassword(savedPassword);
        }
      } catch {}
    };
    loadSavedCredentials();
  }, []);

  // 切换记住侠名时，同步存储偏好
  const handleToggleRemember = useCallback(async () => {
    const next = !rememberMe;
    setRememberMe(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_REMEMBER, String(next));
      if (!next) {
        await AsyncStorage.multiRemove([
          STORAGE_KEY_USERNAME,
          STORAGE_KEY_PASSWORD,
        ]);
      }
    } catch {}
  }, [rememberMe]);

  useEffect(() => {
    const handleSuccess = async (data: any) => {
      // 登录成功时保存或清除账号密码
      try {
        if (rememberMe && username) {
          await AsyncStorage.multiSet([
            [STORAGE_KEY_USERNAME, username],
            [STORAGE_KEY_PASSWORD, password],
          ]);
        } else {
          await AsyncStorage.multiRemove([
            STORAGE_KEY_USERNAME,
            STORAGE_KEY_PASSWORD,
          ]);
        }
      } catch {}

      if (data.hasCharacter) {
        navigation.navigate('GameHome', { characterId: data.characterId });
      } else {
        navigation.navigate('CreateCharacter');
      }
    };

    const handleFailed = (data: any) => {
      showAlert({
        type: 'error',
        title: '登录失败',
        message: data.message,
        buttons: [{ text: '返回' }, { text: '重试', onPress: handleLogin }],
      });
    };

    wsService.on('loginSuccess', handleSuccess);
    wsService.on('loginFailed', handleFailed);

    return () => {
      wsService.off('loginSuccess', handleSuccess);
      wsService.off('loginFailed', handleFailed);
    };
  }, [navigation, rememberMe, username, password]);

  const handleLogin = () => {
    if (!username || !password) {
      showToast({
        type: 'warning',
        title: '提示',
        message: '请填写侠名和口令',
      });
      return;
    }
    if (!wsService.send(MessageFactory.create('login', username, password))) {
      showAlert({
        type: 'error',
        title: '连接断开',
        message: '与服务器的连接已断开，请重试',
        buttons: [
          {
            text: '重新连接',
            onPress: () => wsService.connect('ws://localhost:4001'),
          },
        ],
      });
    }
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
          {/* 顶部装饰 - 渐变分隔线 */}
          <View style={styles.topDecoration}>
            <LinearGradient
              colors={['#8B7A5A00', '#8B7A5A40', '#8B7A5A00']}
              style={styles.gradientBorder}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
            />
          </View>

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
                  placeholder="请输入侠客名号..."
                  placeholderTextColor="#8B7A5A80"
                  value={username}
                  onChangeText={setUsername}
                />
              </View>
            </View>

            {/* 密码输入框 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>口令</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="请输入秘密口令..."
                  placeholderTextColor="#8B7A5A80"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Feather
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={20}
                    color="#8B7A5A60"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* 选项行 */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberMe}
                onPress={handleToggleRemember}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxChecked,
                  ]}
                />
                <Text style={styles.rememberText}>记住账号密码</Text>
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

            {/* 第三方登录 - Feather 图标 */}
            <View style={styles.thirdPartyLogin}>
              <TouchableOpacity style={styles.thirdPartyButton}>
                <Feather name="message-circle" size={24} color="#6B5D4D" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.thirdPartyButton}>
                <Feather name="smartphone" size={24} color="#6B5D4D" />
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

          {/* 底部装饰 - 渐变分隔线 */}
          <View style={styles.bottomDecoration}>
            <LinearGradient
              colors={['#8B7A5A00', '#8B7A5A40', '#8B7A5A00']}
              style={styles.gradientBorderTop}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
            />
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
    justifyContent: 'flex-end',
  },
  gradientBorder: {
    height: 1,
    width: '100%',
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
  passwordWrapper: {
    height: 48,
    backgroundColor: '#F5F0E830',
    borderWidth: 1,
    borderColor: '#8B7A5A40',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    fontSize: 14,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  passwordInput: {
    flex: 1,
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
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#8B7A5A60',
  },
  checkboxChecked: {
    backgroundColor: '#8B7A5A60',
  },
  rememberText: {
    fontSize: 12,
    color: '#6B5D4D',
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
  },
  gradientBorderTop: {
    height: 1,
    width: '100%',
    position: 'absolute',
    top: 0,
  },
  footerText: {
    fontSize: 12,
    color: '#8B7A5A60',
    letterSpacing: 2,
    fontFamily: 'Noto Serif SC',
  },
});
