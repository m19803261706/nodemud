/**
 * NPC 信息弹窗 — 水墨风详情展示
 * 点击 NPC 卡片后弹出，展示完整信息和交互按钮
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { NpcDetailData } from '../../../stores/useGameStore';
import { HpBar } from '../shared';

/** 态度 → 颜色 */
const ATTITUDE_COLORS: Record<string, string> = {
  friendly: '#2F5D3A',
  neutral: '#8B7A5A',
  aggressive: '#8B2500',
};

/** 态度 → 显示文本 */
const ATTITUDE_LABELS: Record<string, string> = {
  friendly: '友善',
  neutral: '中立',
  aggressive: '敌对',
};

/** 态度 → 血条颜色 */
const HP_COLORS: Record<string, string> = {
  friendly: '#5A8A6A',
  neutral: '#6A8A9A',
  aggressive: '#8B4A4A',
};

interface NpcInfoModalProps {
  detail: NpcDetailData | null;
  onClose: () => void;
  onChat: (npcName: string) => void;
}

/** 渐变分隔线 */
const Divider = () => (
  <LinearGradient
    colors={['#8B7A5A00', '#8B7A5A60', '#8B7A5A00']}
    style={s.divider}
    start={{ x: 0, y: 0.5 }}
    end={{ x: 1, y: 0.5 }}
  />
);

export const NpcInfoModal = ({ detail, onClose, onChat }: NpcInfoModalProps) => {
  if (!detail) return null;

  const attColor = ATTITUDE_COLORS[detail.attitude] || '#8B7A5A';
  const attLabel = ATTITUDE_LABELS[detail.attitude] || '中立';
  const hpColor = HP_COLORS[detail.attitude] || '#6A8A9A';
  const genderIcon = detail.gender === 'male' ? '♂' : '♀';
  const genderColor = detail.gender === 'male' ? '#4A90D9' : '#D94A7A';
  const header = detail.title ? `「${detail.title}」${detail.name}` : detail.name;

  return (
    <Modal
      visible={!!detail}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={s.card}>
              {/* 渐变背景 */}
              <LinearGradient
                colors={['#F5F0E8', '#EBE5DA', '#E0D9CC', '#D5CEC0']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
              />

              {/* 描边 */}
              <View style={s.borderOverlay} pointerEvents="none" />

              {/* 内容 */}
              <View style={s.content}>
                {/* 头部：名字 + 性别 */}
                <View style={s.headerRow}>
                  <Text style={s.headerText}>{header}</Text>
                  <Text style={[s.genderIcon, { color: genderColor }]}>{genderIcon}</Text>
                </View>

                {/* 元信息：等级 + 势力 + 态度 */}
                <View style={s.metaRow}>
                  <Text style={s.metaText}>Lv.{detail.level}</Text>
                  {detail.faction ? (
                    <Text style={s.metaText}>{detail.faction}</Text>
                  ) : null}
                  <View style={[s.attBadge, { backgroundColor: attColor + '20' }]}>
                    <Text style={[s.attText, { color: attColor }]}>{attLabel}</Text>
                  </View>
                </View>

                <Divider />

                {/* 简短描述 */}
                <Text style={s.shortDesc}>{detail.short}</Text>

                <Divider />

                {/* 详细描述 */}
                <ScrollView style={s.longScroll} nestedScrollEnabled>
                  <Text style={s.longDesc}>{detail.long}</Text>
                </ScrollView>

                <Divider />

                {/* 血量条 */}
                <View style={s.hpRow}>
                  <Text style={s.hpLabel}>生命</Text>
                  <View style={s.hpBarWrap}>
                    <HpBar pct={detail.hpPct} color={hpColor} />
                  </View>
                  <Text style={s.hpPct}>{detail.hpPct}%</Text>
                </View>

                <Divider />

                {/* 按钮 */}
                <View style={s.buttonRow}>
                  <TouchableOpacity
                    style={s.btnWrap}
                    onPress={() => onChat(detail.name)}
                    activeOpacity={0.7}
                  >
                    <View style={s.btn}>
                      <LinearGradient
                        colors={['#D5CEC0', '#C9C2B4', '#B8B0A0']}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                      />
                      <Text style={s.btnText}>对话</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.btnWrap}
                    onPress={onClose}
                    activeOpacity={0.7}
                  >
                    <View style={s.btn}>
                      <LinearGradient
                        colors={['#D5CEC0', '#C9C2B4', '#B8B0A0']}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                      />
                      <Text style={s.btnText}>关闭</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 290,
    borderRadius: 4,
    overflow: 'hidden',
  },
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: '#8B7A5A40',
    borderRadius: 4,
  },
  content: {
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  genderIcon: {
    fontSize: 14,
    fontFamily: 'Noto Sans SC',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  metaText: {
    fontSize: 12,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  attBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  attText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Noto Serif SC',
  },
  divider: {
    width: '100%',
    height: 1,
    marginVertical: 8,
  },
  shortDesc: {
    fontSize: 13,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  longScroll: {
    maxHeight: 150,
  },
  longDesc: {
    fontSize: 13,
    color: '#5A5550',
    fontFamily: 'Noto Serif SC',
    lineHeight: 22,
  },
  hpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hpLabel: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  hpBarWrap: {
    flex: 1,
  },
  hpPct: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
    width: 36,
    textAlign: 'right',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
  },
  btnWrap: {
    flex: 1,
    marginHorizontal: 6,
  },
  btn: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B7A5A80',
    borderRadius: 2,
    overflow: 'hidden',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 2,
  },
});
