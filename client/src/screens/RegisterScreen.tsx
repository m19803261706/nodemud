/**
 * 注册页面 - 水墨风
 * 完全复刻 Pencil 设计稿（ewe0a）
 * 调整：飞鸽传书（邮箱）→ 联系飞鸽（手机号）
 */

import React, { useState } from 'react';
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

export const RegisterScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  React.useEffect(() => {
    // 监听注册响应
    wsService.on('registerSuccess', (data) => {
      Alert.alert('注册成功', data.message, [
        {
          text: '确定',
          onPress: () => navigation.navigate('CreateCharacter'),
        },
      ]);
    });

    wsService.on('registerFailed', (data) => {
      Alert.alert('注册失败', data.message);
    });
  }, [navigation]);

  const handleRegister = () => {
    // 前端验证
    if (!username || !phone || !password || !confirmPassword) {
      Alert.alert('提示', '请填写完整信息');
      return;
    }

    if (username.length < 3 || username.length > 20) {
      Alert.alert('提示', '侠名长度应为 3-20 个字符');
      return;
    }

    if (phone.length !== 11 || !/^\d{11}$/.test(phone)) {
      Alert.alert('提示', '请输入正确的 11 位手机号');
      return;
    }

    if (password.length < 6) {
      Alert.alert('提示', '口令至少 6 个字符');
      return;
    }

    if (!/(?=.*[0-9])(?=.*[a-zA-Z])/.test(password)) {
      Alert.alert('提示', '口令必须包含数字和字母');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('提示', '两次口令输入不一致');
      return;
    }

    if (!agreeTerms) {
      Alert.alert('提示', '请阅读并同意用户协议');
      return;
    }

    // 发送注册消息
    wsService.send(MessageFactory.create('register', username, password, phone));
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
                  placeholder="为自己取个响亮的名号..."
                  placeholderTextColor="#8B7A5A80"
                  value={username}
                  onChangeText={setUsername}
                />
              </View>
            </View>

            {/* 手机号输入框 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>联系飞鸽</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="请输入你的联系飞鸽..."
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
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="设置一个安全的口令..."
                  placeholderTextColor="#8B7A5A80"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {/* 确认口令输入框 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>确认口令</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="再次输入口令..."
                  placeholderTextColor="#8B7A5A80"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {/* 协议勾选 */}
            <View style={styles.agreeRow}>
              <TouchableOpacity
                style={styles.checkboxWrapper}
                onPress={() => setAgreeTerms(!agreeTerms)}
              >
                <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]} />
              </TouchableOpacity>
              <View style={styles.agreeTextWrap}>
                <Text style={styles.agreeText}>
                  我已阅读并同意
                  <Text style={styles.agreeLink}> 《用户协议》 </Text>
                  和
                  <Text style={styles.agreeLink}> 《隐私政策》</Text>
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

          {/* 底部装饰 */}
          <View style={styles.bottomDecoration}>
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
    borderBottomWidth: 1,
    borderBottomColor: '#8B7A5A40',
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
  input: {
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
  },
  checkboxChecked: {
    backgroundColor: '#8B7A5A60',
  },
  agreeTextWrap: {
    flex: 1,
  },
  agreeText: {
    fontSize: 12,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    lineHeight: 18,
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
    paddingVertical: 16,
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
