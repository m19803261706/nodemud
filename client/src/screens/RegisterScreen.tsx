/**
 * 注册页面 - 水墨风
 * 完全复刻 Pencil 设计稿（ewe0a）
 * 调整：飞鸽传书（邮箱）→ 联系飞鸽（手机号）
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { MessageFactory } from '@packages/core';
import { wsService } from '../services/WebSocketService';
import { useUI } from '../components';

export const RegisterScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { showAlert, showToast } = useUI();

  useEffect(() => {
    wsService.on('registerSuccess', data => {
      showAlert({
        type: 'success',
        title: '注册成功',
        message: data.message,
        buttons: [
          {
            text: '进入江湖',
            onPress: () => navigation.navigate('CreateCharacter'),
          },
        ],
      });
    });

    wsService.on('registerFailed', data => {
      showAlert({
        type: 'error',
        title: '注册失败',
        message: data.message,
        buttons: [{ text: '返回' }, { text: '重试', onPress: handleRegister }],
      });
    });
  }, [navigation]);

  const handleRegister = () => {
    if (!username || !phone || !password || !confirmPassword) {
      showToast({ type: 'warning', title: '提示', message: '请填写完整信息' });
      return;
    }

    if (username.length < 6 || username.length > 20) {
      showToast({
        type: 'warning',
        title: '提示',
        message: '侠名长度应为 6-20 个字符',
      });
      return;
    }

    if (!/(?=.*[0-9])(?=.*[a-zA-Z])/.test(username)) {
      showToast({
        type: 'warning',
        title: '提示',
        message: '侠名必须包含数字和字母',
      });
      return;
    }

    if (!/^\d{11}$/.test(phone)) {
      showToast({
        type: 'warning',
        title: '提示',
        message: '请输入正确的 11 位手机号',
      });
      return;
    }

    if (password.length < 6) {
      showToast({
        type: 'warning',
        title: '提示',
        message: '口令至少 6 个字符',
      });
      return;
    }

    if (!/(?=.*[0-9])(?=.*[a-zA-Z])/.test(password)) {
      showToast({
        type: 'warning',
        title: '提示',
        message: '口令必须包含数字和字母',
      });
      return;
    }

    if (password !== confirmPassword) {
      showToast({
        type: 'warning',
        title: '提示',
        message: '两次口令输入不一致',
      });
      return;
    }

    if (!agreeTerms) {
      showToast({
        type: 'warning',
        title: '提示',
        message: '请阅读并同意江湖规矩',
      });
      return;
    }

    if (
      !wsService.send(
        MessageFactory.create('register', username, password, phone),
      )
    ) {
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
            <Text style={styles.mainTitle}>创建侠号</Text>
            <Text style={styles.subtitle}>加入武林，开启你的传奇之旅</Text>
          </View>

          {/* 表单区域 */}
          <View style={styles.formArea}>
            {/* 侠名输入框 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>侠名</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="6-20位，需包含数字和字母"
                  placeholderTextColor="#8B7A5A80"
                  value={username}
                  onChangeText={setUsername}
                  maxLength={20}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* 手机号输入框（设计稿为邮箱，调整为手机号） */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>联系飞鸽</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="请输入11位手机号"
                  placeholderTextColor="#8B7A5A80"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="numeric"
                  maxLength={11}
                />
              </View>
            </View>

            {/* 设置口令输入框 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>设置口令</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="至少6位，需包含数字和字母"
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
                    size={18}
                    color="#8B7A5A60"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* 确认口令输入框 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>确认口令</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="再次输入口令"
                  placeholderTextColor="#8B7A5A80"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Feather
                    name={showConfirmPassword ? 'eye' : 'eye-off'}
                    size={18}
                    color="#8B7A5A60"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* 协议勾选 */}
            <View style={styles.agreeRow}>
              <TouchableOpacity
                style={styles.checkboxWrapper}
                onPress={() => setAgreeTerms(!agreeTerms)}
              >
                <View
                  style={[
                    styles.checkbox,
                    agreeTerms && styles.checkboxChecked,
                  ]}
                >
                  {agreeTerms && (
                    <Feather name="check" size={12} color="#6B5D4D" />
                  )}
                </View>
              </TouchableOpacity>
              <View style={styles.agreeTextWrap}>
                <Text style={styles.agreeText}>
                  我已阅读并同意
                  <Text style={styles.agreeLink}> 《江湖规矩》 </Text>与
                  <Text style={styles.agreeLink}> 《侠客守则》</Text>
                </Text>
              </View>
            </View>

            {/* 注册按钮 */}
            <TouchableOpacity onPress={handleRegister}>
              <LinearGradient
                colors={['#D5CEC0', '#C9C2B4', '#B8B0A0']}
                style={styles.registerButton}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
              >
                <Text style={styles.registerButtonText}>立即加入</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.spacer} />

            {/* 登录提示 */}
            <View style={styles.loginHint}>
              <Text style={styles.hintText}>已有侠号？</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>返回登录</Text>
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
            <Text style={styles.footerText}>江湖路远 · 不负韶华</Text>
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
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    gap: 12,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3A3530',
    letterSpacing: 6,
    fontFamily: 'Noto Serif SC',
  },
  subtitle: {
    fontSize: 13,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  formArea: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 16,
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  inputWrapper: {
    height: 44,
    backgroundColor: '#F5F0E830',
    borderWidth: 1,
    borderColor: '#8B7A5A40',
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  passwordWrapper: {
    height: 44,
    backgroundColor: '#F5F0E830',
    borderWidth: 1,
    borderColor: '#8B7A5A40',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    fontSize: 13,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  passwordInput: {
    flex: 1,
    fontSize: 13,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 4,
  },
  checkboxWrapper: {
    paddingTop: 2,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#8B7A5A60',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: 'transparent',
  },
  agreeTextWrap: {
    flex: 1,
  },
  agreeText: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    lineHeight: 17,
  },
  agreeLink: {
    color: '#6B5D4D',
    fontWeight: '500',
  },
  registerButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B7A5A80',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A3530',
    letterSpacing: 4,
    fontFamily: 'Noto Serif SC',
  },
  spacer: {
    flex: 1,
  },
  loginHint: {
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
  loginLink: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  bottomDecoration: {
    height: 70,
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
