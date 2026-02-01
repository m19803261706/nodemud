/**
 * 命格揭示页面 - 创建角色第 2 步
 * 发送出身请求，打字机展示命格诗句，展示四维度星级
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { MessageFactory } from '@packages/core';
import type { CharacterAttributes } from '@packages/core';
import { wsService } from '../services/WebSocketService';
import { TypewriterText, useTypewriterSequence, useUI } from '../components';

/** 命格数据（从服务端接收） */
interface FateData {
  fateName: string;
  fatePoem: string;
  fateType: string;
  destiny: number;
  benefactor: number;
  calamity: number;
  fortune: number;
  attributeCaps: CharacterAttributes;
  wuxingju: string;
  mingzhuStar: string;
  shenzhuStar: string;
}

/** 维度名称映射 */
const DIMENSION_NAMES = [
  { key: 'destiny', label: '命数', desc: '天命气运' },
  { key: 'benefactor', label: '贵人', desc: '遇贵人相助' },
  { key: 'calamity', label: '劫数', desc: '逢劫难磨砺' },
  { key: 'fortune', label: '机缘', desc: '奇遇际遇' },
];

/** 渲染星级 */
const renderStars = (value: number, max: number = 5) => {
  let result = '';
  for (let i = 0; i < max; i++) {
    result += i < value ? '★' : '☆';
  }
  return result;
};

/** 打字机旁白 — 等待排盘期间 */
const FATE_INTRO_TEXTS = [
  '天有日月，人有命数。',
  '紫微垣中，一百零八颗星辰轮转不休，每一颗都牵系着世间某人的来路与归途。',
  '且看这漫天星斗，为你排下怎样一盘棋局——',
];

export const FateRevealScreen = ({ navigation, route }: any) => {
  const { origin, gender } = route.params;
  const [fateData, setFateData] = useState<FateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [introComplete, setIntroComplete] = useState(false);
  const [fateRevealed, setFateRevealed] = useState(false);
  const fateOpacity = useState(new Animated.Value(0))[0];
  const detailOpacity = useState(new Animated.Value(0))[0];
  const { showAlert } = useUI();

  // 发送出身请求
  useEffect(() => {
    const msg = MessageFactory.create('createCharacterStep1', origin, gender);
    if (!wsService.send(msg)) {
      showAlert({
        type: 'error',
        title: '连接断开',
        message: '与服务器的连接已断开',
        buttons: [{ text: '返回', onPress: () => navigation.goBack() }],
      });
    }
  }, [origin, gender, navigation, showAlert]);

  // 监听服务端响应
  useEffect(() => {
    const handleFate = (data: FateData) => {
      setFateData(data);
      setLoading(false);
    };

    const handleFailed = (data: { reason: string; message: string }) => {
      setLoading(false);
      showAlert({
        type: 'error',
        title: '命格生成失败',
        message: data.message,
        buttons: [{ text: '返回', onPress: () => navigation.goBack() }],
      });
    };

    wsService.on('createCharacterFate', handleFate);
    wsService.on('createCharacterFailed', handleFailed);

    return () => {
      wsService.off('createCharacterFate', handleFate);
      wsService.off('createCharacterFailed', handleFailed);
    };
  }, [navigation, showAlert]);

  // 旁白完成后，如果命格已到，开始揭示
  useEffect(() => {
    if (introComplete && fateData && !fateRevealed) {
      setFateRevealed(true);
      Animated.timing(fateOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [introComplete, fateData, fateRevealed, fateOpacity]);

  /** 命格名显示完毕后，显示详情 */
  const handleFateNameComplete = useCallback(() => {
    Animated.timing(detailOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [detailOpacity]);

  const handleContinue = useCallback(() => {
    if (!fateData) {
      return;
    }
    navigation.navigate('AttributeAllocate', {
      origin,
      gender,
      fateData,
    });
  }, [fateData, origin, gender, navigation]);

  return (
    <LinearGradient
      colors={['#F5F0E8', '#EBE5DA', '#E0D9CC', '#D5CEC0']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* 打字机旁白（排盘过渡） */}
        {!introComplete && (
          <View style={styles.introContainer}>
            <View style={styles.introContent}>
              <IntroSequence
                texts={FATE_INTRO_TEXTS}
                onComplete={() => setIntroComplete(true)}
              />
            </View>
            {loading && (
              <Text style={styles.loadingText}>紫微排盘中...</Text>
            )}
          </View>
        )}

        {/* 命格揭示 */}
        {fateRevealed && fateData && (
          <Animated.View style={[styles.fateContainer, { opacity: fateOpacity }]}>
            {/* 命格名 */}
            <View style={styles.fateNameArea}>
              <TypewriterText
                text={fateData.fateName}
                speed={200}
                style={styles.fateName}
                showCursor={false}
                onComplete={handleFateNameComplete}
              />
            </View>

            {/* 命格详情（渐入） */}
            <Animated.View style={[styles.fateDetail, { opacity: detailOpacity }]}>
              {/* 诗句 */}
              <Text style={styles.fatePoem}>{fateData.fatePoem}</Text>

              {/* 装饰线 */}
              <LinearGradient
                colors={['#8B7A5A00', '#8B7A5A40', '#8B7A5A00']}
                style={styles.divider}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
              />

              {/* 四维度 */}
              <View style={styles.dimensionGrid}>
                {DIMENSION_NAMES.map(dim => (
                  <View key={dim.key} style={styles.dimensionItem}>
                    <Text style={styles.dimensionLabel}>{dim.label}</Text>
                    <Text style={styles.dimensionStars}>
                      {renderStars(fateData[dim.key as keyof FateData] as number)}
                    </Text>
                    <Text style={styles.dimensionDesc}>{dim.desc}</Text>
                  </View>
                ))}
              </View>

              {/* 附加信息 */}
              <View style={styles.extraInfo}>
                <Text style={styles.extraText}>
                  {fateData.wuxingju} · 命主{fateData.mingzhuStar} · 身主{fateData.shenzhuStar}
                </Text>
              </View>

              {/* 继续按钮 */}
              <TouchableOpacity onPress={handleContinue} style={styles.continueArea}>
                <LinearGradient
                  colors={['#D5CEC0', '#C9C2B4', '#B8B0A0']}
                  style={styles.continueButton}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                >
                  <Text style={styles.continueText}>查看根基分布</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        )}

        {/* 返回按钮 */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>返回</Text>
        </TouchableOpacity>
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
    <>
      {visibleTexts.map((text, i) => (
        <TypewriterText
          key={i}
          text={text}
          speed={70}
          style={styles.introText}
          onComplete={i === currentIndex ? handleComplete : undefined}
          showCursor={i === currentIndex}
        />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  // 打字机旁白
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
  loadingText: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    fontSize: 13,
    color: '#8B7A5A80',
    fontFamily: 'Noto Serif SC',
  },
  // 命格展示
  fateContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  fateNameArea: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  fateName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3A3530',
    letterSpacing: 8,
    fontFamily: 'Noto Serif SC',
  },
  fateDetail: {
    flex: 1,
    gap: 20,
    alignItems: 'center',
  },
  fatePoem: {
    fontSize: 15,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    width: '80%',
  },
  // 四维度
  dimensionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  dimensionItem: {
    width: '42%',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#8B7A5A20',
    backgroundColor: '#F5F0E840',
  },
  dimensionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 4,
  },
  dimensionStars: {
    fontSize: 16,
    color: '#8B7A5A',
    letterSpacing: 2,
  },
  dimensionDesc: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  // 附加信息
  extraInfo: {
    paddingVertical: 8,
  },
  extraText: {
    fontSize: 12,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 1,
  },
  // 按钮
  continueArea: {
    width: '100%',
    paddingTop: 8,
  },
  continueButton: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B7A5A80',
  },
  continueText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A3530',
    letterSpacing: 4,
    fontFamily: 'Noto Serif SC',
  },
  backButton: {
    position: 'absolute',
    top: 56,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backText: {
    fontSize: 14,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
});
