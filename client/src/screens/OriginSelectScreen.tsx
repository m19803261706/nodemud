/**
 * 出身选择页面 - 创建角色第 1 步
 * 打字机旁白过渡后展示六种出身卡片
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { TypewriterText, useTypewriterSequence } from '../components';

/** 出身配置数据（与服务端 ORIGIN_CONFIG 对应） */
const ORIGINS = [
  {
    key: 'noble' as const,
    name: '世家子弟',
    story: '武林世家的后人，家道中落，身怀残缺秘籍踏入江湖。',
    perk: '起步带一本残缺家传秘籍',
    bonus: '慧根+1 气海+1',
    icon: '族',
  },
  {
    key: 'wanderer' as const,
    name: '江湖浪子',
    story: '从小在市井中摸爬滚打，见惯了三教九流。',
    perk: '起步有额外银两和江湖关系',
    bonus: '心眼+1 血气+1',
    icon: '浪',
  },
  {
    key: 'scholar' as const,
    name: '书院学子',
    story: '读圣贤书的文人，偶入江湖，以智谋立足。',
    perk: '识字能力强，能读更多秘籍',
    bonus: '慧根+2 筋骨-1',
    icon: '书',
  },
  {
    key: 'soldier' as const,
    name: '边塞军卒',
    story: '从军归来的退役兵士，一身杀伐之气。',
    perk: '起步带一把制式兵器',
    bonus: '筋骨+1 血气+1',
    icon: '兵',
  },
  {
    key: 'herbalist' as const,
    name: '山野药童',
    story: '深山采药人的徒弟，通晓草木之性。',
    perk: '懂基础药理，能辨认草药',
    bonus: '脉络+1 心眼+1',
    icon: '药',
  },
  {
    key: 'beggar' as const,
    name: '乞丐流民',
    story: '一无所有的底层人，却有着非凡的际遇。',
    perk: '机缘维度+2，奇遇概率大增',
    bonus: '无属性加成',
    icon: '丐',
  },
];

/** 打字机旁白文字（原创） */
const INTRO_TEXTS = [
  '官道上走了三天三夜，脚底的草鞋磨穿了两双。远处群山如墨，近处炊烟零落，一间歪歪斜斜的客栈挑着半面酒旗。',
  '掌柜是个独臂老头儿，右手翻炒着锅里的花生米，头也不抬地问了一句：',
  '"小家伙，打哪儿来的？"',
  '你怔了一怔。是啊，你打哪儿来？又要往何处去？',
  '这一路上你想了无数遍，却始终没有答案。或许答案就藏在前方那条看不见尽头的路上。',
];

export const OriginSelectScreen = ({ navigation, route }: any) => {
  const gender = route.params?.gender || 'male';
  const [selectedOrigin, setSelectedOrigin] = useState<string | null>(null);
  const [showContent, setShowContent] = useState(false);
  const contentOpacity = useState(new Animated.Value(0))[0];

  const { currentIndex, visibleTexts, handleComplete, allComplete } =
    useTypewriterSequence(INTRO_TEXTS, {
      speed: 70,
      delayBetween: 800,
      onAllComplete: () => {
        setShowContent(true);
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      },
    });

  const handleContinue = useCallback(() => {
    if (!selectedOrigin) {
      return;
    }
    navigation.navigate('FateReveal', { origin: selectedOrigin, gender });
  }, [selectedOrigin, gender, navigation]);

  /** 跳过打字机动画 */
  const handleSkip = useCallback(() => {
    setShowContent(true);
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [contentOpacity]);

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
            <View style={styles.introContent}>
              {visibleTexts.map((text, i) => (
                <TypewriterText
                  key={i}
                  text={text}
                  speed={70}
                  delay={0}
                  onComplete={i === currentIndex ? handleComplete : undefined}
                  style={[
                    styles.introText,
                    i === visibleTexts.length - 1 && styles.introTextLast,
                  ]}
                  showCursor={i === currentIndex}
                />
              ))}
            </View>
            <Text style={styles.skipHint}>点击屏幕跳过</Text>
          </TouchableOpacity>
        )}

        {/* 出身选择内容 */}
        {showContent && (
          <Animated.View
            style={[styles.mainContent, { opacity: contentOpacity }]}
          >
            {/* 标题 */}
            <View style={styles.header}>
              <Text style={styles.title}>择出身</Text>
              <Text style={styles.subtitle}>每段传奇，皆有来处</Text>
            </View>

            {/* 出身卡片列表 */}
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {ORIGINS.map(origin => (
                <TouchableOpacity
                  key={origin.key}
                  style={[
                    styles.originCard,
                    selectedOrigin === origin.key && styles.originCardSelected,
                  ]}
                  onPress={() => setSelectedOrigin(origin.key)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.iconBox}>
                      <Text style={styles.iconText}>{origin.icon}</Text>
                    </View>
                    <View style={styles.cardTitleArea}>
                      <Text style={styles.originName}>{origin.name}</Text>
                      <Text style={styles.originBonus}>{origin.bonus}</Text>
                    </View>
                    {selectedOrigin === origin.key && (
                      <View style={styles.selectedMark}>
                        <Text style={styles.selectedMarkText}>已选</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.originStory}>{origin.story}</Text>
                  <View style={styles.perkRow}>
                    <Text style={styles.perkLabel}>特长</Text>
                    <Text style={styles.perkText}>{origin.perk}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* 底部按钮 */}
            <View style={styles.footer}>
              <TouchableOpacity
                onPress={handleContinue}
                disabled={!selectedOrigin}
              >
                <LinearGradient
                  colors={
                    selectedOrigin
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
                      !selectedOrigin && styles.continueTextDisabled,
                    ]}
                  >
                    天命已定，观我命格
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
  introTextLast: {
    color: '#3A3530',
    fontWeight: '500',
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
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
    gap: 8,
  },
  title: {
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
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 12,
  },
  // 出身卡片
  originCard: {
    backgroundColor: '#F5F0E830',
    borderWidth: 1,
    borderColor: '#8B7A5A30',
    padding: 16,
    gap: 10,
  },
  originCardSelected: {
    borderColor: '#3A3530',
    borderWidth: 2,
    backgroundColor: '#F5F0E860',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#8B7A5A40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    fontWeight: '700',
  },
  cardTitleArea: {
    flex: 1,
    gap: 2,
  },
  originName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 2,
  },
  originBonus: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  selectedMark: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#3A3530',
  },
  selectedMarkText: {
    fontSize: 11,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  originStory: {
    fontSize: 13,
    color: '#6B5D4D',
    lineHeight: 20,
    fontFamily: 'Noto Serif SC',
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  perkLabel: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    borderWidth: 1,
    borderColor: '#8B7A5A40',
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  perkText: {
    fontSize: 12,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    flex: 1,
  },
  // 底部按钮
  footer: {
    paddingHorizontal: 24,
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
});
