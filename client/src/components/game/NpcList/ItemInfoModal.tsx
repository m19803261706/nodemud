/**
 * 物品信息弹窗 — 水墨风物品/容器详情展示
 * 普通物品：名称 + 描述 + [拾取] [鉴定]
 * 容器：名称 + 描述 + 内容物列表（每项可取出）+ [拾取] [鉴定]
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
import LinearGradient from '../../LinearGradient';
import type { ItemDetailData } from '../../../stores/useGameStore';
import type { ItemBrief } from '@packages/core';

/** 物品类型 → 中文 */
const TYPE_LABEL: Record<string, string> = {
  weapon: '武器',
  armor: '防具',
  medicine: '药品',
  book: '秘籍',
  container: '容器',
  food: '食物',
  key: '钥匙',
  misc: '杂物',
  remains: '残骸',
};

interface ItemInfoModalProps {
  detail: ItemDetailData | null;
  onClose: () => void;
  onGet: (name: string) => void;
  onGetFrom: (itemName: string, containerName: string) => void;
  onExamine: (name: string) => void;
}

/** 通用按钮 */
const ActionButton = ({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={s.btnWrap} onPress={onPress} activeOpacity={0.7}>
    <View style={s.btn}>
      <LinearGradient
        colors={['#D5CEC0', '#C9C2B4', '#B8B0A0']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Text style={s.btnText}>{label}</Text>
    </View>
  </TouchableOpacity>
);

/** 渐变分隔线 */
const Divider = () => (
  <LinearGradient
    colors={['#8B7A5A00', '#8B7A5A60', '#8B7A5A00']}
    style={s.divider}
    start={{ x: 0, y: 0.5 }}
    end={{ x: 1, y: 0.5 }}
  />
);

/** 内容物条目 */
const ContentItem = ({
  item,
  onTake,
}: {
  item: ItemBrief;
  onTake: () => void;
}) => (
  <View style={s.contentItem}>
    <View style={s.contentItemInfo}>
      <Text style={s.contentItemName}>{item.name}</Text>
      <Text style={s.contentItemType}>
        {TYPE_LABEL[item.type] || item.type}
      </Text>
    </View>
    <TouchableOpacity style={s.takeBtn} onPress={onTake} activeOpacity={0.7}>
      <Text style={s.takeBtnText}>取出</Text>
    </TouchableOpacity>
  </View>
);

export const ItemInfoModal = ({
  detail,
  onClose,
  onGet,
  onGetFrom,
  onExamine,
}: ItemInfoModalProps) => {
  if (!detail) return null;

  const isContainer = !!detail.containerId;
  const displayName = isContainer
    ? detail.containerName || '容器'
    : detail.name || '物品';
  const typeLabel = isContainer
    ? detail.isRemains
      ? '残骸'
      : '容器'
    : TYPE_LABEL[detail.type || ''] || detail.type || '';

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
              <LinearGradient
                colors={['#F5F0E8', '#EBE5DA', '#E0D9CC', '#D5CEC0']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
              />
              <View style={s.borderOverlay} pointerEvents="none" />

              <View style={s.content}>
                {/* 头部 */}
                <View style={s.headerRow}>
                  <Text style={s.headerText}>{displayName}</Text>
                  <View style={s.typeBadge}>
                    <Text style={s.typeText}>{typeLabel}</Text>
                  </View>
                </View>

                <Divider />

                {/* 描述 */}
                {detail.long ? (
                  <View>
                    <Text style={s.longDesc}>{detail.long}</Text>
                    <Divider />
                  </View>
                ) : null}

                {/* 容器内容物 */}
                {isContainer ? (
                  <View>
                    <Text style={s.sectionTitle}>
                      内容物
                      {detail.contents && detail.contents.length > 0
                        ? ` (${detail.contents.length})`
                        : ''}
                    </Text>
                    <ScrollView style={s.contentsList} nestedScrollEnabled>
                      {detail.contents && detail.contents.length > 0 ? (
                        detail.contents.map((item) => (
                          <ContentItem
                            key={item.id}
                            item={item}
                            onTake={() => {
                              onGetFrom(item.name, displayName);
                            }}
                          />
                        ))
                      ) : (
                        <Text style={s.emptyText}>空空如也</Text>
                      )}
                    </ScrollView>
                    <Divider />
                  </View>
                ) : null}

                {/* 按钮 */}
                <View style={s.buttonRow}>
                  <ActionButton
                    label="拾取"
                    onPress={() => {
                      onGet(displayName);
                      onClose();
                    }}
                  />
                  <ActionButton
                    label="鉴定"
                    onPress={() => {
                      onExamine(displayName);
                      onClose();
                    }}
                  />
                  <ActionButton label="关闭" onPress={onClose} />
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
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  typeBadge: {
    backgroundColor: '#8B7A5A20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  typeText: {
    fontSize: 10,
    color: '#8B7A5A',
    fontWeight: '600',
    fontFamily: 'Noto Serif SC',
  },
  divider: {
    width: '100%',
    height: 1,
    marginVertical: 8,
  },
  longDesc: {
    fontSize: 13,
    color: '#5A5550',
    fontFamily: 'Noto Serif SC',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    marginBottom: 6,
  },
  contentsList: {
    maxHeight: 160,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#8B7A5A20',
  },
  contentItemInfo: {
    flex: 1,
  },
  contentItemName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  contentItemType: {
    fontSize: 10,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    marginTop: 1,
  },
  takeBtn: {
    backgroundColor: '#8B7A5A15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#8B7A5A40',
  },
  takeBtnText: {
    fontSize: 11,
    color: '#6B5D4D',
    fontWeight: '600',
    fontFamily: 'Noto Serif SC',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#A09888',
    fontFamily: 'Noto Serif SC',
    paddingVertical: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 6,
  },
  btnWrap: {
    flex: 1,
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
  btnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 2,
  },
});
