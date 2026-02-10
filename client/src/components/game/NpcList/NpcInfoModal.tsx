/**
 * NPC 信息弹窗 — 水墨风详情展示
 * 点击 NPC 卡片后弹出，展示完整信息和交互按钮
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  FlatList,
} from 'react-native';
import LinearGradient from '../../LinearGradient';
import type { NpcDetailData } from '../../../stores/useGameStore';
import type { InventoryItem } from '@packages/core';
import { HpBar } from '../shared';
import { QuestSection } from './QuestSection';

/** 装备槽位 → 叙述动词（MUD 风格） */
const POSITION_VERB: Record<string, string> = {
  head: '头戴',
  body: '身着',
  hands: '手上戴着',
  feet: '脚蹬',
  waist: '腰系',
  weapon: '手持',
  offhand: '另一手持着',
  neck: '颈上挂着',
  finger: '指上戴着',
  wrist: '腕上戴着',
};

/** 品质 → 颜色（凡品默认色，精良及以上高亮） */
const QUALITY_COLORS: Record<number, string> = {
  1: '#6B5D4D', // COMMON
  2: '#2E8B57', // FINE
  3: '#4169E1', // RARE
  4: '#9932CC', // EPIC
  5: '#FF8C00', // LEGENDARY
};

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
  inventory: InventoryItem[];
  onClose: () => void;
  onChat: (npcName: string) => void;
  onShop: (npcName: string) => void;
  onApprentice: (npcName: string) => void;
  onDonate: (itemName: string, npcName: string) => void;
  onSpar: (npcName: string) => void;
  onBetray: (npcName: string) => void;
  onSell: (itemName: string, npcName: string) => void;
  onAttack: (npcName: string) => void;
  onGive: (itemName: string, npcName: string) => void;
  onQuestAccept: (questId: string, npcId: string) => void;
  onQuestComplete: (questId: string, npcId: string) => void;
}

interface NpcActionButton {
  key: string;
  label: string;
  variant?: 'danger';
  onPress: () => void;
}

/** 通用按钮（水墨渐变） */
const ActionButton = ({
  label,
  onPress,
  variant,
}: {
  label: string;
  onPress: () => void;
  variant?: 'danger';
}) => (
  <TouchableOpacity style={s.btnWrap} onPress={onPress} activeOpacity={0.7}>
    <View style={[s.btn, variant === 'danger' ? s.btnDanger : undefined]}>
      <LinearGradient
        colors={
          variant === 'danger'
            ? ['#D5C0C0', '#C9B4B4', '#B8A0A0']
            : ['#D5CEC0', '#C9C2B4', '#B8B0A0']
        }
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Text
        style={[s.btnText, variant === 'danger' ? s.btnTextDanger : undefined]}
      >
        {label}
      </Text>
    </View>
  </TouchableOpacity>
);

/** 给予列表分隔线 */
const GiveDivider = () => <View style={s.giveDivider} />;

/** 渐变分隔线 */
const Divider = () => (
  <LinearGradient
    colors={['#8B7A5A00', '#8B7A5A60', '#8B7A5A00']}
    style={s.divider}
    start={{ x: 0, y: 0.5 }}
    end={{ x: 1, y: 0.5 }}
  />
);

export const NpcInfoModal = ({
  detail,
  inventory,
  onClose,
  onChat,
  onShop,
  onApprentice,
  onDonate,
  onSpar,
  onBetray,
  onSell,
  onAttack,
  onGive,
  onQuestAccept,
  onQuestComplete,
}: NpcInfoModalProps) => {
  const [actionListMode, setActionListMode] = useState<
    'give' | 'sell' | 'donate' | null
  >(null);

  /** 关闭时重置交易选择状态 */
  const handleClose = () => {
    setActionListMode(null);
    onClose();
  };

  if (!detail) return null;

  const attColor = ATTITUDE_COLORS[detail.attitude] || '#8B7A5A';
  const attLabel = ATTITUDE_LABELS[detail.attitude] || '中立';
  const hpColor = HP_COLORS[detail.attitude] || '#6A8A9A';
  const genderIcon = detail.gender === 'male' ? '♂' : '♀';
  const genderColor = detail.gender === 'male' ? '#4A90D9' : '#D94A7A';
  const header = detail.title
    ? `「${detail.title}」${detail.name}`
    : detail.name;
  const isSelectingItem = actionListMode !== null;
  const selectingTitle =
    actionListMode === 'sell'
      ? '选择出售物品'
      : actionListMode === 'donate'
        ? '选择捐献物品'
        : '选择给予物品';
  const actionSet = new Set(detail.actions ?? []);
  const hasActions = actionSet.size > 0;
  const canChat = hasActions
    ? actionSet.has('chat')
    : (detail.capabilities?.chat ?? true);
  const canShopList = hasActions
    ? actionSet.has('shopList')
    : (detail.capabilities?.shopList ?? detail.capabilities?.shop ?? false);
  const canShopSell = hasActions
    ? actionSet.has('shopSell')
    : (detail.capabilities?.shopSell ?? detail.capabilities?.shop ?? false);
  const canGive = hasActions
    ? actionSet.has('give')
    : (detail.capabilities?.give ?? true);
  const canApprentice = hasActions ? actionSet.has('apprentice') : false;
  const canDonate = hasActions ? actionSet.has('donate') : false;
  const canSpar = hasActions ? actionSet.has('spar') : false;
  const canBetray = hasActions ? actionSet.has('betray') : false;
  const canAttack = hasActions
    ? actionSet.has('attack')
    : (detail.capabilities?.attack ?? true);

  const actionButtons: NpcActionButton[] = [];

  if (canChat) {
    actionButtons.push({
      key: 'chat',
      label: '对话',
      onPress: () => onChat(detail.name),
    });
  }

  if (canShopList) {
    actionButtons.push({
      key: 'shop-list',
      label: '货单',
      onPress: () => {
        onShop(detail.name);
        handleClose();
      },
    });
  }

  if (canShopSell) {
    actionButtons.push({
      key: 'shop-sell',
      label: '出售',
      onPress: () => setActionListMode('sell'),
    });
  }

  if (canGive) {
    actionButtons.push({
      key: 'give',
      label: '给予',
      onPress: () => setActionListMode('give'),
    });
  }

  if (canApprentice) {
    actionButtons.push({
      key: 'apprentice',
      label: '拜师',
      onPress: () => {
        onApprentice(detail.name);
        handleClose();
      },
    });
  }

  if (canDonate) {
    actionButtons.push({
      key: 'donate',
      label: '捐献',
      onPress: () => setActionListMode('donate'),
    });
  }

  if (canSpar) {
    actionButtons.push({
      key: 'spar',
      label: '演武',
      onPress: () => {
        onSpar(detail.name);
        handleClose();
      },
    });
  }

  if (canBetray) {
    actionButtons.push({
      key: 'betray',
      label: '叛门',
      variant: 'danger',
      onPress: () => {
        onBetray(detail.name);
        handleClose();
      },
    });
  }

  if (canAttack) {
    actionButtons.push({
      key: 'attack',
      label: '攻击',
      variant: 'danger',
      onPress: () => {
        onAttack(detail.name);
        handleClose();
      },
    });
  }

  actionButtons.push({
    key: 'close',
    label: '关闭',
    onPress: handleClose,
  });

  const actionRows: NpcActionButton[][] = [];
  for (let i = 0; i < actionButtons.length; i += 2) {
    actionRows.push(actionButtons.slice(i, i + 2));
  }

  return (
    <Modal
      visible={!!detail}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
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
                  <Text style={[s.genderIcon, { color: genderColor }]}>
                    {genderIcon}
                  </Text>
                </View>

                {/* 元信息：等级 + 势力 + 态度 */}
                <View style={s.metaRow}>
                  <Text style={s.metaText}>Lv.{detail.level}</Text>
                  {detail.faction ? (
                    <Text style={s.metaText}>{detail.faction}</Text>
                  ) : null}
                  <View
                    style={[s.attBadge, { backgroundColor: attColor + '20' }]}
                  >
                    <Text style={[s.attText, { color: attColor }]}>
                      {attLabel}
                    </Text>
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

                {/* 装备描述（MUD 叙述风格） */}
                {detail.equipment && detail.equipment.length > 0 ? (
                  <View>
                    <Divider />
                    <Text style={s.eqNarrative}>
                      {detail.equipment.map((eq, idx) => {
                        const verb = POSITION_VERB[eq.position] || '装备着';
                        const sep =
                          idx < detail.equipment!.length - 1 ? '，' : '。';
                        return (
                          <React.Fragment key={idx}>
                            <Text style={s.eqVerb}>{verb}</Text>
                            <Text
                              style={{
                                color: QUALITY_COLORS[eq.quality] || '#6B5D4D',
                                fontFamily: 'Noto Serif SC',
                                fontWeight: '500',
                              }}
                            >
                              {eq.name}
                            </Text>
                            <Text style={s.eqVerb}>{sep}</Text>
                          </React.Fragment>
                        );
                      })}
                    </Text>
                  </View>
                ) : null}

                {/* 任务区域 */}
                {detail.capabilities?.quests &&
                  detail.capabilities.quests.length > 0 && (
                    <View>
                      <QuestSection
                        quests={detail.capabilities.quests}
                        npcId={detail.npcId}
                        npcName={detail.name}
                        onAccept={onQuestAccept}
                        onComplete={onQuestComplete}
                      />
                      <Divider />
                    </View>
                  )}

                <Divider />

                {/* 按钮（按 NPC 能力动态渲染） */}
                <View style={s.buttonGrid}>
                  {actionRows.map((row, rowIndex) => (
                    <View
                      style={s.buttonRow}
                      key={`npc-action-row-${rowIndex}`}
                    >
                      {row.map(button => (
                        <ActionButton
                          key={button.key}
                          label={button.label}
                          onPress={button.onPress}
                          variant={button.variant}
                        />
                      ))}
                      {row.length === 1 ? <View style={s.btnWrap} /> : null}
                    </View>
                  ))}
                </View>

                {/* 给予/出售物品选择列表 */}
                {isSelectingItem && (
                  <View style={s.giveOverlay}>
                    <View style={s.giveHeader}>
                      <Text style={s.giveTitle}>{selectingTitle}</Text>
                      <TouchableOpacity onPress={() => setActionListMode(null)}>
                        <Text style={s.giveBack}>返回</Text>
                      </TouchableOpacity>
                    </View>
                    <GiveDivider />
                    {inventory.length === 0 ? (
                      <Text style={s.giveEmpty}>背包空空如也</Text>
                    ) : (
                      <FlatList
                        data={inventory}
                        keyExtractor={item => item.id}
                        style={s.giveList}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={s.giveItem}
                            activeOpacity={0.6}
                            onPress={() => {
                              if (actionListMode === 'sell') {
                                onSell(item.name, detail.name);
                              } else if (actionListMode === 'donate') {
                                onDonate(item.name, detail.name);
                              } else {
                                onGive(item.name, detail.name);
                              }
                              handleClose();
                            }}
                          >
                            <Text style={s.giveItemName}>{item.name}</Text>
                            <Text style={s.giveItemDesc}>{item.short}</Text>
                          </TouchableOpacity>
                        )}
                        ItemSeparatorComponent={GiveDivider}
                      />
                    )}
                  </View>
                )}
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
  eqNarrative: {
    fontSize: 13,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    lineHeight: 22,
  },
  eqVerb: {
    color: '#8B7A5A',
  },
  buttonGrid: {
    gap: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
  },
  btnWrap: {
    flex: 1,
    marginHorizontal: 4,
  },
  btn: {
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B7A5A80',
    borderRadius: 2,
    overflow: 'hidden',
  },
  btnDanger: {
    borderColor: '#8B5A5A80',
  },
  btnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 2,
  },
  btnTextDanger: {
    color: '#8B2500',
  },
  /* 给予物品选择列表 */
  giveOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F5F0E8',
    paddingTop: 14,
    paddingHorizontal: 4,
  },
  giveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  giveTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  giveBack: {
    fontSize: 12,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  giveDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8B7A5A40',
  },
  giveEmpty: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 13,
    color: '#A09888',
    fontFamily: 'Noto Serif SC',
  },
  giveList: {
    maxHeight: 260,
  },
  giveItem: {
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  giveItemName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  giveItemDesc: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    marginTop: 2,
  },
});
