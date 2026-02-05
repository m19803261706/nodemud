/**
 * ItemActionSheet -- 物品操作弹窗
 * 水墨风 Modal，展示物品信息和操作按钮
 * 点击按钮发送对应指令
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { InventoryItem } from '@packages/core';
import { useGameStore } from '../../../stores/useGameStore';

/** 操作 → 指令映射 */
function actionToCommand(action: string, item: InventoryItem): string {
  switch (action) {
    case '装备':
      return item.type === 'weapon'
        ? `wield ${item.name}`
        : `wear ${item.name}`;
    case '丢弃':
      return `drop ${item.name}`;
    case '查看':
      return `look ${item.name}`;
    case '使用':
    case '研读':
      return `use ${item.name}`;
    default:
      return `${action} ${item.name}`;
  }
}

/** 物品类型中文映射 */
const ITEM_TYPE_LABEL: Record<string, string> = {
  weapon: '武器',
  armor: '防具',
  medicine: '药品',
  book: '秘籍',
  container: '容器',
  food: '食物',
  key: '钥匙',
  misc: '杂物',
};

/** 渐变分隔线 */
const Divider = () => (
  <LinearGradient
    colors={['#8B7A5A00', '#8B7A5A60', '#8B7A5A00']}
    style={s.divider}
    start={{ x: 0, y: 0.5 }}
    end={{ x: 1, y: 0.5 }}
  />
);

interface ItemActionSheetProps {
  item: InventoryItem | null;
  onClose: () => void;
}

export const ItemActionSheet = ({ item, onClose }: ItemActionSheetProps) => {
  const sendCommand = useGameStore(state => state.sendCommand);

  /** 点击操作按钮 */
  const handleAction = useCallback(
    (action: string) => {
      if (!item) return;
      const cmd = actionToCommand(action, item);
      sendCommand(cmd);
      onClose();
    },
    [item, sendCommand, onClose],
  );

  if (!item) return null;

  const typeLabel = ITEM_TYPE_LABEL[item.type] || item.type;

  return (
    <Modal
      visible={!!item}
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
                {/* 物品名 + 类型 */}
                <View style={s.headerRow}>
                  <Text style={s.headerText}>{item.name}</Text>
                  <View style={s.typeBadge}>
                    <Text style={s.typeText}>{typeLabel}</Text>
                  </View>
                </View>

                {/* 简短描述 */}
                {item.short ? (
                  <>
                    <Divider />
                    <Text style={s.shortDesc}>{item.short}</Text>
                  </>
                ) : null}

                <Divider />

                {/* 物品属性 */}
                <View style={s.metaRow}>
                  <Text style={s.metaText}>
                    重量: {item.weight}
                  </Text>
                  <Text style={s.metaText}>
                    价值: {item.value}
                  </Text>
                  {item.count > 1 && (
                    <Text style={s.metaText}>
                      数量: {item.count}
                    </Text>
                  )}
                </View>

                <Divider />

                {/* 操作按钮列表 */}
                <ScrollView
                  style={s.actionsScroll}
                  contentContainerStyle={s.actionsContent}
                  nestedScrollEnabled
                >
                  {item.actions.map(action => (
                    <TouchableOpacity
                      key={action}
                      style={s.actionBtnWrap}
                      onPress={() => handleAction(action)}
                      activeOpacity={0.7}
                    >
                      <View style={s.actionBtn}>
                        <LinearGradient
                          colors={['#D5CEC0', '#C9C2B4', '#B8B0A0']}
                          style={StyleSheet.absoluteFill}
                          start={{ x: 0.5, y: 0 }}
                          end={{ x: 0.5, y: 1 }}
                        />
                        <Text style={s.actionBtnText}>{action}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* 关闭按钮 */}
                <TouchableOpacity
                  style={s.closeBtnWrap}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <View style={s.closeBtn}>
                    <LinearGradient
                      colors={['#D5CEC0', '#C9C2B4', '#B8B0A0']}
                      style={StyleSheet.absoluteFill}
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                    />
                    <Text style={s.closeBtnText}>关闭</Text>
                  </View>
                </TouchableOpacity>
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
    width: 280,
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
    gap: 8,
    marginBottom: 4,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#8B7A5A20',
    borderRadius: 3,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8B7A5A',
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
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  actionsScroll: {
    maxHeight: 150,
  },
  actionsContent: {
    gap: 6,
  },
  actionBtnWrap: {},
  actionBtn: {
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B7A5A80',
    borderRadius: 2,
    overflow: 'hidden',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 2,
  },
  closeBtnWrap: {
    marginTop: 10,
  },
  closeBtn: {
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B7A5A50',
    borderRadius: 2,
    overflow: 'hidden',
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 2,
  },
});
