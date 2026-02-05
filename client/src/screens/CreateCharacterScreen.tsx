/**
 * 创建角色入口页面
 * 打字机旁白 + 性别选择后进入出身选择流程
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import LinearGradient from '../components/LinearGradient';
import { TypewriterText } from '../components';

/** 打字机旁白文字（原创，模拟金庸叙事口吻） */
const INTRO_TEXT =
  '那年深秋，嘉兴府南湖上薄雾如纱，几只乌篷船泊在芦苇荡里，桨声都听不真切。岸边茶棚的说书先生拍了一下醒木，道："诸位客官且听——这武林中的恩怨情仇，说到底不过八个字。"\n"身不由己，命不由天。"\n你攥紧了包袱，推开那扇吱呀作响的柴门，踏入了这滚滚红尘。';

export const CreateCharacterScreen = ({ navigation }: any) => {
  const [showContent, setShowContent] = useState(false);
  const [selectedGender, setSelectedGender] = useState<
    'male' | 'female' | null
  >(null);
  const contentOpacity = useState(new Animated.Value(0))[0];

  const handleIntroComplete = useCallback(() => {
    setShowContent(true);
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [contentOpacity]);

  const handleSkip = useCallback(() => {
    setShowContent(true);
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [contentOpacity]);

  const handleContinue = useCallback(() => {
    if (!selectedGender) {
      return;
    }
    navigation.navigate('OriginSelect', { gender: selectedGender });
  }, [selectedGender, navigation]);

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
            onPress={handleSkip}
          >
            <TypewriterText
              text={INTRO_TEXT}
              speed={80}
              onComplete={handleIntroComplete}
              style={styles.introText}
            />
            <Text style={styles.skipHint}>点击屏幕跳过</Text>
          </TouchableOpacity>
        )}

        {/* 性别选择 */}
        {showContent && (
          <Animated.View
            style={[styles.mainContent, { opacity: contentOpacity }]}
          >
            {/* 装饰线 */}
            <View style={styles.topDecoration}>
              <LinearGradient
                colors={['#8B7A5A00', '#8B7A5A40', '#8B7A5A00']}
                style={styles.gradientLine}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
              />
            </View>

            <View style={styles.genderSection}>
              <Text style={styles.title}>入江湖</Text>
              <Text style={styles.subtitle}>先定阴阳，再论出身</Text>

              <View style={styles.genderRow}>
                <TouchableOpacity
                  style={[
                    styles.genderCard,
                    selectedGender === 'male' && styles.genderCardSelected,
                  ]}
                  onPress={() => setSelectedGender('male')}
                >
                  <Text style={styles.genderIcon}>侠</Text>
                  <Text style={styles.genderLabel}>少年郎</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderCard,
                    selectedGender === 'female' && styles.genderCardSelected,
                  ]}
                  onPress={() => setSelectedGender('female')}
                >
                  <Text style={styles.genderIcon}>侠</Text>
                  <Text style={styles.genderLabel}>女侠客</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 继续按钮 */}
            <View style={styles.footer}>
              <TouchableOpacity
                onPress={handleContinue}
                disabled={!selectedGender}
              >
                <LinearGradient
                  colors={
                    selectedGender
                      ? ['#D5CEC0', '#C9C2B4', '#B8B0A0']
                      : ['#E0D9CC', '#E0D9CC', '#E0D9CC']
                  }
                  style={styles.continueButton}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                >
                  <Text
                    style={[
                      styles.continueText,
                      !selectedGender && styles.continueTextDisabled,
                    ]}
                  >
                    选定出身
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* 底部装饰 */}
            <View style={styles.bottomDecoration}>
              <LinearGradient
                colors={['#8B7A5A00', '#8B7A5A40', '#8B7A5A00']}
                style={styles.gradientLine}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
              />
              <Text style={styles.footerText}>命由天定 · 路在脚下</Text>
            </View>
          </Animated.View>
        )}
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
  // 打字机旁白
  introContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  introText: {
    fontSize: 18,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    lineHeight: 32,
    letterSpacing: 2,
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
  topDecoration: {
    height: 60,
    justifyContent: 'flex-end',
  },
  gradientLine: {
    height: 1,
    width: '100%',
  },
  genderSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    gap: 20,
  },
  title: {
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
    marginBottom: 20,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 24,
  },
  genderCard: {
    width: 130,
    height: 160,
    borderWidth: 1,
    borderColor: '#8B7A5A30',
    backgroundColor: '#F5F0E830',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  genderCardSelected: {
    borderColor: '#3A3530',
    borderWidth: 2,
    backgroundColor: '#F5F0E860',
  },
  genderIcon: {
    fontSize: 40,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    fontWeight: '700',
  },
  genderLabel: {
    fontSize: 16,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 2,
  },
  // 底部
  footer: {
    paddingHorizontal: 30,
    paddingVertical: 16,
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
  continueTextDisabled: {
    color: '#8B7A5A60',
  },
  bottomDecoration: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#8B7A5A60',
    letterSpacing: 2,
    fontFamily: 'Noto Serif SC',
    marginTop: 12,
  },
});
