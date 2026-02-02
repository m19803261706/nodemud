/**
 * 属性分配页面 - 创建角色第 3 步
 * 三丹田六属性分配，18 点根基分配
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { CharacterAttributes } from '@packages/core';
import { TypewriterText } from '../components';

/** 属性总根基点 */
const TOTAL_POINTS = 18;

/** 出身加成配置（前端展示用） */
const ORIGIN_BONUS: Record<
  string,
  Partial<Record<keyof CharacterAttributes, number>>
> = {
  noble: { wisdom: 1, spirit: 1 },
  wanderer: { perception: 1, vitality: 1 },
  scholar: { wisdom: 2, strength: -1 },
  soldier: { strength: 1, vitality: 1 },
  herbalist: { meridian: 1, perception: 1 },
  beggar: {},
};

/** 三丹田分组 */
const DANTIAN_GROUPS = [
  {
    name: '上丹田·神',
    attrs: [
      { key: 'wisdom' as const, label: '慧根', desc: '悟道之资' },
      { key: 'perception' as const, label: '心眼', desc: '洞察之明' },
    ],
  },
  {
    name: '中丹田·气',
    attrs: [
      { key: 'spirit' as const, label: '气海', desc: '内力之源' },
      { key: 'meridian' as const, label: '脉络', desc: '经脉之通' },
    ],
  },
  {
    name: '下丹田·精',
    attrs: [
      { key: 'strength' as const, label: '筋骨', desc: '外功之基' },
      { key: 'vitality' as const, label: '血气', desc: '生机之本' },
    ],
  },
];

/** 属性帮助说明 */
const HELP_ITEMS = [
  {
    label: '慧根',
    detail:
      '悟道之资。影响修炼速度、秘籍领悟和内功心法的理解能力。慧根高者，一点即通。',
  },
  {
    label: '心眼',
    detail:
      '洞察之明。影响战斗中的闪避、暗器命中和对敌人招式的预判。心眼利者，察秋毫于未萌。',
  },
  {
    label: '气海',
    detail: '内力之源。决定内力上限和内功威力。气海深者，一掌可开山裂石。',
  },
  {
    label: '脉络',
    detail:
      '经脉之通。影响内力回复速度和运功疗伤效率。脉络畅者，真气周天运转不息。',
  },
  {
    label: '筋骨',
    detail:
      '外功之基。决定外功伤害和负重能力。筋骨强者，拳脚之间已有千钧之力。',
  },
  {
    label: '血气',
    detail: '生机之本。决定生命上限和抗击打能力。血气旺者，刀剑加身亦可硬扛。',
  },
];

/** 打字机旁白（原创） */
const INTRO_TEXT =
  '老道将铜钱收好，从柜子里翻出一面铜镜。镜面昏暗，映不出人影，却隐隐有光华流转。"命格是天给的，但这副骨头是自己的。"老道把铜镜推到你面前，"人有三丹田——神、气、精。上丹田主悟性灵觉，中丹田通经脉内息，下丹田定筋骨血气。"\n他竖起一根手指："一共十八分根基。怎么分，你自己拿主意。这决定了你往后在江湖上吃饭的本事。想清楚了再落子，落子无悔。"';

export const AttributeAllocateScreen = ({ navigation, route }: any) => {
  const { origin, gender, fateData } = route.params;
  const caps: CharacterAttributes = fateData.attributeCaps;
  const bonus = ORIGIN_BONUS[origin] || {};

  const [showContent, setShowContent] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const contentOpacity = useState(new Animated.Value(0))[0];

  // 初始化：每项 1 点（总 6 点已用），剩余 12 点
  const [attrs, setAttrs] = useState<CharacterAttributes>({
    wisdom: 1,
    perception: 1,
    spirit: 1,
    meridian: 1,
    strength: 1,
    vitality: 1,
  });

  const usedPoints = useMemo(() => {
    return Object.values(attrs).reduce((sum, v) => sum + v, 0);
  }, [attrs]);

  const remaining = TOTAL_POINTS - usedPoints;

  const handleIntroComplete = useCallback(() => {
    setShowContent(true);
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [contentOpacity]);

  const handleAdd = useCallback(
    (key: keyof CharacterAttributes) => {
      setAttrs(prev => {
        const current = prev[key];
        if (remaining <= 0 || current >= caps[key]) {
          return prev;
        }
        return { ...prev, [key]: current + 1 };
      });
    },
    [remaining, caps],
  );

  const handleSub = useCallback((key: keyof CharacterAttributes) => {
    setAttrs(prev => {
      const current = prev[key];
      if (current <= 1) {
        return prev;
      }
      return { ...prev, [key]: current - 1 };
    });
  }, []);

  const handleContinue = useCallback(() => {
    if (remaining !== 0) {
      return;
    }
    navigation.navigate('CharacterConfirm', {
      origin,
      gender,
      fateData,
      attributes: attrs,
    });
  }, [remaining, origin, gender, fateData, attrs, navigation]);

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
            <TypewriterText
              text={INTRO_TEXT}
              speed={70}
              onComplete={handleIntroComplete}
              style={styles.introText}
            />
            <Text style={styles.skipHint}>点击屏幕跳过</Text>
          </TouchableOpacity>
        )}

        {/* 属性分配主内容 */}
        {showContent && (
          <Animated.View
            style={[styles.mainContent, { opacity: contentOpacity }]}
          >
            {/* 顶部 */}
            <View style={styles.header}>
              {/* 帮助按钮 */}
              <TouchableOpacity
                style={styles.helpBtn}
                onPress={() => setShowHelp(true)}
              >
                <Text style={styles.helpBtnText}>?</Text>
              </TouchableOpacity>
              <Text style={styles.title}>分根基</Text>
              <Text style={styles.fateHint}>
                命格「{fateData.fateName}」决定了各属性天赋上限
              </Text>
              <View style={styles.pointsRow}>
                <Text style={styles.pointsLabel}>剩余根基点</Text>
                <Text
                  style={[
                    styles.pointsValue,
                    remaining === 0 && styles.pointsValueDone,
                  ]}
                >
                  {remaining}
                </Text>
                <Text style={styles.pointsTotal}>/ {TOTAL_POINTS}</Text>
              </View>
            </View>

            {/* 属性列表 */}
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {DANTIAN_GROUPS.map(group => (
                <View key={group.name} style={styles.dantianGroup}>
                  <View style={styles.dantianHeader}>
                    <LinearGradient
                      colors={['#8B7A5A00', '#8B7A5A30']}
                      style={styles.dantianLine}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                    />
                    <Text style={styles.dantianName}>{group.name}</Text>
                    <LinearGradient
                      colors={['#8B7A5A30', '#8B7A5A00']}
                      style={styles.dantianLine}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                    />
                  </View>

                  {group.attrs.map(attr => {
                    const val = attrs[attr.key];
                    const cap = caps[attr.key];
                    const bonusVal = bonus[attr.key] || 0;
                    const canAdd = remaining > 0 && val < cap;
                    const canSub = val > 1;

                    return (
                      <View key={attr.key} style={styles.attrRow}>
                        <View style={styles.attrTop}>
                          <View style={styles.attrInfo}>
                            <Text style={styles.attrLabel}>{attr.label}</Text>
                            <Text style={styles.attrDesc}>{attr.desc}</Text>
                          </View>

                          <View style={styles.attrControls}>
                            <TouchableOpacity
                              style={[
                                styles.controlBtn,
                                !canSub && styles.controlBtnDisabled,
                              ]}
                              onPress={() => handleSub(attr.key)}
                              disabled={!canSub}
                            >
                              <Text
                                style={[
                                  styles.controlBtnText,
                                  !canSub && styles.controlBtnTextDisabled,
                                ]}
                              >
                                -
                              </Text>
                            </TouchableOpacity>

                            <View style={styles.valueArea}>
                              <Text style={styles.valueText}>{val}</Text>
                              {bonusVal !== 0 && (
                                <Text style={styles.bonusText}>
                                  ({bonusVal > 0 ? '+' : ''}
                                  {bonusVal})
                                </Text>
                              )}
                            </View>

                            <TouchableOpacity
                              style={[
                                styles.controlBtn,
                                !canAdd && styles.controlBtnDisabled,
                              ]}
                              onPress={() => handleAdd(attr.key)}
                              disabled={!canAdd}
                            >
                              <Text
                                style={[
                                  styles.controlBtnText,
                                  !canAdd && styles.controlBtnTextDisabled,
                                ]}
                              >
                                +
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* 刻度条：直观显示当前值与上限 */}
                        <View style={styles.barRow}>
                          <View style={styles.barTrack}>
                            {Array.from({ length: 10 }).map((_, i) => (
                              <View
                                key={i}
                                style={[
                                  styles.barSegment,
                                  i < val && styles.barSegmentFilled,
                                  i >= cap && styles.barSegmentLocked,
                                ]}
                              />
                            ))}
                          </View>
                          <Text style={styles.capLabel}>上限 {cap}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))}
            </ScrollView>

            {/* 底部 */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.backArea}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backText}>重选出身</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleContinue}
                disabled={remaining !== 0}
                style={styles.continueArea}
              >
                <LinearGradient
                  colors={
                    remaining === 0
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
                      remaining !== 0 && styles.continueTextDisabled,
                    ]}
                  >
                    取名入江湖
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
        {/* 帮助弹窗 */}
        <Modal
          visible={showHelp}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => setShowHelp(false)}
        >
          <View style={styles.helpOverlay}>
            <View style={styles.helpCard}>
              <LinearGradient
                colors={['#F5F0E8', '#EBE5DA', '#E0D9CC', '#D5CEC0']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
              />
              <View style={styles.helpBorder} pointerEvents="none" />

              <ScrollView
                style={styles.helpScroll}
                contentContainerStyle={styles.helpScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.helpTitle}>属性说明</Text>

                <View style={styles.helpSection}>
                  <Text style={styles.helpSectionTitle}>三丹田六属性</Text>
                  {HELP_ITEMS.map(item => (
                    <View key={item.label} style={styles.helpItem}>
                      <Text style={styles.helpItemLabel}>{item.label}</Text>
                      <Text style={styles.helpItemDetail}>{item.detail}</Text>
                    </View>
                  ))}
                </View>

                <LinearGradient
                  colors={['#8B7A5A00', '#8B7A5A40', '#8B7A5A00']}
                  style={styles.helpDivider}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                />

                <View style={styles.helpSection}>
                  <Text style={styles.helpSectionTitle}>规则说明</Text>
                  <Text style={styles.helpRuleText}>
                    {
                      '· 共 18 点根基可自由分配，每项至少 1 点\n· 每项属性有天赋上限，由命格决定\n· 上限范围 4~10，上限越高潜力越大\n· 出身会额外加减属性（不占根基点）\n· 分配完成后不可更改，请谨慎决定'
                    }
                  </Text>
                </View>
              </ScrollView>

              <TouchableOpacity
                style={styles.helpCloseArea}
                onPress={() => setShowHelp(false)}
              >
                <LinearGradient
                  colors={['#D5CEC0', '#C9C2B4', '#B8B0A0']}
                  style={styles.helpCloseBtn}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                >
                  <Text style={styles.helpCloseText}>知道了</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  // 打字机
  introContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 36,
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
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 12,
    gap: 8,
  },
  helpBtn: {
    position: 'absolute',
    top: 16,
    right: 20,
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: '#8B7A5A60',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  helpBtnText: {
    fontSize: 16,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3A3530',
    letterSpacing: 6,
    fontFamily: 'Noto Serif SC',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fateHint: {
    fontSize: 12,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 1,
  },
  pointsLabel: {
    fontSize: 13,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  pointsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  pointsTotal: {
    fontSize: 14,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  pointsValueDone: {
    color: '#8B7A5A',
  },
  // 属性列表
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  dantianGroup: {
    marginBottom: 16,
  },
  dantianHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  dantianLine: {
    flex: 1,
    height: 1,
  },
  dantianName: {
    fontSize: 13,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 2,
  },
  // 属性行
  attrRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#8B7A5A15',
    gap: 6,
  },
  attrTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attrInfo: {
    gap: 2,
  },
  attrLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 2,
  },
  attrDesc: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  attrControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlBtn: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: '#3A3530',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnDisabled: {
    borderColor: '#8B7A5A40',
  },
  controlBtnText: {
    fontSize: 20,
    color: '#3A3530',
    fontWeight: '700',
  },
  controlBtnTextDisabled: {
    color: '#8B7A5A40',
  },
  valueArea: {
    flexDirection: 'row',
    alignItems: 'baseline',
    minWidth: 40,
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  bonusText: {
    fontSize: 12,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    marginLeft: 2,
  },
  // 刻度条
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barTrack: {
    flex: 1,
    flexDirection: 'row',
    gap: 2,
  },
  barSegment: {
    flex: 1,
    height: 6,
    backgroundColor: '#8B7A5A15',
  },
  barSegmentFilled: {
    backgroundColor: '#6B5D4D',
  },
  barSegmentLocked: {
    backgroundColor: '#8B7A5A08',
  },
  capLabel: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    minWidth: 40,
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
  continueArea: {
    flex: 1,
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
  // 帮助弹窗
  helpOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpCard: {
    width: '85%',
    maxHeight: '80%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  helpBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: '#8B7A5A40',
    borderRadius: 4,
  },
  helpScroll: {
    maxHeight: 460,
  },
  helpScrollContent: {
    padding: 24,
    paddingBottom: 8,
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 20,
  },
  helpSection: {
    gap: 10,
  },
  helpSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 2,
    marginBottom: 4,
  },
  helpItem: {
    gap: 4,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#8B7A5A15',
  },
  helpItemLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 2,
  },
  helpItemDetail: {
    fontSize: 12,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    lineHeight: 20,
  },
  helpDivider: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
  helpRuleText: {
    fontSize: 13,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    lineHeight: 22,
  },
  helpCloseArea: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
  },
  helpCloseBtn: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B7A5A80',
    borderRadius: 2,
  },
  helpCloseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 2,
  },
});
