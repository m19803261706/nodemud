/**
 * 角色确认页面 - 创建角色第 4 步
 * 输入角色名，预览角色信息，确认创建
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
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { MessageFactory } from '@packages/core';
import type { CharacterAttributes } from '@packages/core';
import { wsService } from '../services/WebSocketService';
import { TypewriterText, useTypewriterSequence, useUI } from '../components';

/** 角色名正则：2-6 个中文字符 */
const NAME_REGEX = /^[\u4e00-\u9fa5]{2,6}$/;

/** 出身名称映射 */
const ORIGIN_NAMES: Record<string, string> = {
  noble: '世家子弟',
  wanderer: '江湖浪子',
  scholar: '书院学子',
  soldier: '边塞军卒',
  herbalist: '山野药童',
  beggar: '乞丐流民',
};

/** 属性名称映射 */
const ATTR_LABELS: Record<keyof CharacterAttributes, string> = {
  wisdom: '慧根',
  perception: '心眼',
  spirit: '气海',
  meridian: '脉络',
  strength: '筋骨',
  vitality: '血气',
};

/** 维度名称 */
const DIM_LABELS = [
  { key: 'destiny', label: '命数' },
  { key: 'benefactor', label: '贵人' },
  { key: 'calamity', label: '劫数' },
  { key: 'fortune', label: '机缘' },
];

const renderStars = (value: number, max: number = 5) => {
  let result = '';
  for (let i = 0; i < max; i++) {
    result += i < value ? '★' : '☆';
  }
  return result;
};

/** 打字机旁白 */
const INTRO_TEXTS = [
  '根基已定，六脉归位。',
  '江湖之中，名号便是一柄无形之剑。它可以是你的盾，也可以是你的枷锁。',
  '少侠，你叫什么名字？',
];

export const CharacterConfirmScreen = ({ navigation, route }: any) => {
  const { origin, gender, fateData, attributes } = route.params;
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const contentOpacity = useState(new Animated.Value(0))[0];
  const { showAlert, showToast } = useUI();

  // 监听创建结果
  useEffect(() => {
    const handleSuccess = (data: { characterId: string; characterName: string; message: string }) => {
      setLoading(false);
      showToast({
        type: 'success',
        title: '角色创建成功',
        message: data.message,
      });
      // 跳转到游戏主页
      setTimeout(() => {
        navigation.replace('GameHome', {
          characterId: data.characterId,
          characterName: data.characterName,
        });
      }, 1500);
    };

    const handleFailed = (data: { reason: string; message: string }) => {
      setLoading(false);
      if (data.reason === 'name_exists') {
        setNameError('此名号已有人使用');
      } else if (data.reason === 'name_invalid') {
        setNameError(data.message);
      } else {
        showAlert({
          type: 'error',
          title: '创建失败',
          message: data.message,
          buttons: [{ text: '知道了' }],
        });
      }
    };

    wsService.on('createCharacterSuccess', handleSuccess);
    wsService.on('createCharacterFailed', handleFailed);

    return () => {
      wsService.off('createCharacterSuccess', handleSuccess);
      wsService.off('createCharacterFailed', handleFailed);
    };
  }, [navigation, showAlert, showToast]);

  const handleIntroComplete = useCallback(() => {
    setShowContent(true);
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [contentOpacity]);

  const handleNameChange = useCallback((text: string) => {
    setName(text);
    setNameError('');
  }, []);

  const validateName = useCallback((text: string): boolean => {
    if (!text) {
      setNameError('请输入角色名');
      return false;
    }
    if (!NAME_REGEX.test(text)) {
      setNameError('角色名须为 2-6 个中文字符');
      return false;
    }
    return true;
  }, []);

  const handleConfirm = useCallback(() => {
    if (!validateName(name)) {
      return;
    }
    setLoading(true);
    const msg = MessageFactory.create('createCharacterConfirm', name, origin, attributes);
    if (!wsService.send(msg)) {
      setLoading(false);
      showAlert({
        type: 'error',
        title: '连接断开',
        message: '与服务器的连接已断开',
        buttons: [{ text: '知道了' }],
      });
    }
  }, [name, origin, attributes, validateName, showAlert]);

  return (
    <LinearGradient
      colors={['#F5F0E8', '#EBE5DA', '#E0D9CC', '#D5CEC0']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* 打字机旁白 */}
        {!showContent && (
          <TouchableOpacity
            style={styles.introContainer}
            activeOpacity={0.9}
            onPress={handleIntroComplete}
          >
            <IntroSequence texts={INTRO_TEXTS} onComplete={handleIntroComplete} />
            <Text style={styles.skipHint}>点击屏幕跳过</Text>
          </TouchableOpacity>
        )}

        {/* 确认主内容 */}
        {showContent && (
          <Animated.View style={[styles.mainContent, { opacity: contentOpacity }]}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* 角色名输入 */}
              <View style={styles.nameSection}>
                <Text style={styles.sectionTitle}>取名入江湖</Text>
                <View style={styles.nameInputWrapper}>
                  <TextInput
                    style={styles.nameInput}
                    placeholder="请赐名号..."
                    placeholderTextColor="#8B7A5A80"
                    value={name}
                    onChangeText={handleNameChange}
                    maxLength={6}
                    autoFocus
                  />
                </View>
                {nameError ? (
                  <Text style={styles.nameError}>{nameError}</Text>
                ) : (
                  <Text style={styles.nameHint}>2-6 个中文字符</Text>
                )}
              </View>

              {/* 分隔线 */}
              <LinearGradient
                colors={['#8B7A5A00', '#8B7A5A40', '#8B7A5A00']}
                style={styles.divider}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
              />

              {/* 角色信息预览 */}
              <View style={styles.previewSection}>
                <Text style={styles.previewTitle}>角色一览</Text>

                {/* 出身与命格 */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>出身</Text>
                  <Text style={styles.infoValue}>{ORIGIN_NAMES[origin]}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>命格</Text>
                  <Text style={styles.infoValue}>{fateData.fateName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>五行</Text>
                  <Text style={styles.infoValue}>{fateData.wuxingju}</Text>
                </View>

                {/* 四维度 */}
                <View style={styles.dimRow}>
                  {DIM_LABELS.map(dim => (
                    <View key={dim.key} style={styles.dimItem}>
                      <Text style={styles.dimLabel}>{dim.label}</Text>
                      <Text style={styles.dimStars}>
                        {renderStars(fateData[dim.key] as number)}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* 六属性 */}
                <View style={styles.attrGrid}>
                  {(Object.keys(ATTR_LABELS) as (keyof CharacterAttributes)[]).map(
                    key => (
                      <View key={key} style={styles.attrItem}>
                        <Text style={styles.attrLabel}>{ATTR_LABELS[key]}</Text>
                        <Text style={styles.attrValue}>{attributes[key]}</Text>
                        <Text style={styles.attrCap}>
                          /{fateData.attributeCaps[key]}
                        </Text>
                      </View>
                    ),
                  )}
                </View>
              </View>
            </ScrollView>

            {/* 底部按钮 */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.backArea}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backText}>返回</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirm}
                disabled={loading || !name}
                style={styles.confirmArea}
              >
                <LinearGradient
                  colors={
                    name && !loading
                      ? ['#D5CEC0', '#C9C2B4', '#B8B0A0']
                      : ['#E0D9CC', '#E0D9CC', '#E0D9CC']
                  }
                  style={styles.confirmButton}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                >
                  <Text
                    style={[
                      styles.confirmText,
                      (!name || loading) && styles.confirmTextDisabled,
                    ]}
                  >
                    {loading ? '创建中...' : '踏入江湖'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

/** 旁白序列子组件 */
const IntroSequence: React.FC<{
  texts: string[];
  onComplete: () => void;
}> = ({ texts, onComplete }) => {
  const { currentIndex, visibleTexts, handleComplete } =
    useTypewriterSequence(texts, {
      speed: 70,
      delayBetween: 800,
      onAllComplete: () => {
        setTimeout(onComplete, 600);
      },
    });

  return (
    <View style={styles.introContent}>
      {visibleTexts.map((text: string, i: number) => (
        <TypewriterText
          key={i}
          text={text}
          speed={70}
          style={styles.introText}
          onComplete={i === currentIndex ? handleComplete : undefined}
          showCursor={i === currentIndex}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  // 打字机
  introContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  introContent: {
    gap: 20,
  },
  introText: {
    fontSize: 16,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    lineHeight: 28,
    letterSpacing: 1,
  },
  skipHint: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    fontSize: 12,
    color: '#8B7A5A60',
    fontFamily: 'Noto Serif SC',
  },
  // 主内容
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  // 角色名输入
  nameSection: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3A3530',
    letterSpacing: 6,
    fontFamily: 'Noto Serif SC',
  },
  nameInputWrapper: {
    width: '80%',
    height: 52,
    backgroundColor: '#F5F0E830',
    borderWidth: 1,
    borderColor: '#8B7A5A40',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  nameInput: {
    fontSize: 20,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    textAlign: 'center',
    letterSpacing: 4,
  },
  nameError: {
    fontSize: 12,
    color: '#B85450',
    fontFamily: 'Noto Serif SC',
  },
  nameHint: {
    fontSize: 12,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
  // 预览
  previewSection: {
    gap: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 2,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#8B7A5A15',
  },
  infoLabel: {
    fontSize: 14,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  infoValue: {
    fontSize: 14,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    fontWeight: '500',
  },
  // 四维度
  dimRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  dimItem: {
    alignItems: 'center',
    gap: 4,
  },
  dimLabel: {
    fontSize: 12,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  dimStars: {
    fontSize: 14,
    color: '#8B7A5A',
    letterSpacing: 1,
  },
  // 六属性
  attrGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 8,
  },
  attrItem: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#8B7A5A20',
    backgroundColor: '#F5F0E840',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 2,
  },
  attrLabel: {
    fontSize: 13,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  attrValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  attrCap: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  // 底部
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    gap: 12,
  },
  backArea: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#8B7A5A40',
  },
  backText: {
    fontSize: 14,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  confirmArea: {
    flex: 1,
  },
  confirmButton: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B7A5A80',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A3530',
    letterSpacing: 4,
    fontFamily: 'Noto Serif SC',
  },
  confirmTextDisabled: {
    color: '#8B7A5A60',
  },
});
