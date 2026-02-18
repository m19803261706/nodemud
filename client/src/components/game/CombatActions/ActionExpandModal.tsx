/**
 * ActionExpandModal — 全部招式展开弹窗
 * 当招式超过快捷栏容量时，点击"更多"弹出完整列表
 * 每个招式显示详细描述、资源消耗和冷却状态
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import type { CombatActionOption, ResourceCostInfo } from '@packages/core';
import LinearGradient from '../../LinearGradient';

/** 资源类型 → 中文名称 */
const RESOURCE_NAME: Record<string, string> = {
  mp: '内力',
  energy: '精力',
  hp: '气血',
};

interface ActionExpandModalProps {
  visible: boolean;
  actions: CombatActionOption[];
  onSelect: (action: CombatActionOption) => void;
  onClose: () => void;
  awaitingAction?: boolean;
}

/** 资源消耗标签 */
const CostTag = ({ cost }: { cost: ResourceCostInfo }) => (
  <View style={s.costTag}>
    <Text style={s.costTagText}>
      {RESOURCE_NAME[cost.resource] || cost.resource} {cost.amount}
    </Text>
  </View>
);

/** 冷却标签 */
const CooldownTag = ({ remaining }: { remaining: number }) => (
  <View style={s.cooldownTag}>
    <Text style={s.cooldownTagText}>冷却 {remaining} 回合</Text>
  </View>
);

/** 单个招式行 */
const ActionRow = ({
  action,
  onPress,
  disabled,
}: {
  action: CombatActionOption;
  onPress: () => void;
  disabled?: boolean;
}) => {
  const isCooling = action.cooldownRemaining > 0;
  const isDisabled = disabled || !action.canUse || isCooling;

  return (
    <TouchableOpacity
      style={[s.row, isDisabled && s.rowDisabled]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={isDisabled}
    >
      <View style={s.rowHeader}>
        <View style={s.rowTitleWrap}>
          <Text
            style={[s.rowName, action.isInternal && s.internalText]}
            numberOfLines={1}
          >
            {action.actionName}
          </Text>
          <Text style={s.rowSkill} numberOfLines={1}>
            {action.skillName} Lv.{action.lvl}
          </Text>
        </View>
        {action.isInternal ? (
          <View style={s.internalBadge}>
            <Text style={s.internalBadgeText}>内功</Text>
          </View>
        ) : null}
      </View>

      {action.actionDesc ? (
        <Text style={s.rowDesc} numberOfLines={2}>
          {action.actionDesc}
        </Text>
      ) : null}

      <View style={s.tagRow}>
        {action.costs.length > 0 ? (
          <View style={s.costRow}>
            {action.costs.map((c, i) => (
              <CostTag key={`${c.resource}-${i}`} cost={c} />
            ))}
          </View>
        ) : null}
        {isCooling ? <CooldownTag remaining={action.cooldownRemaining} /> : null}
      </View>
    </TouchableOpacity>
  );
};

export const ActionExpandModal = ({
  visible,
  actions,
  onSelect,
  onClose,
  awaitingAction,
}: ActionExpandModalProps) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
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
                {/* 标题 */}
                <Text style={s.title}>选择招式</Text>

                <LinearGradient
                  colors={['#8B7A5A00', '#8B7A5A60', '#8B7A5A00']}
                  style={s.divider}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                />

                {/* 招式列表 */}
                <ScrollView style={s.list} showsVerticalScrollIndicator={false}>
                  {actions.map(action => (
                    <ActionRow
                      key={action.index}
                      action={action}
                      onPress={() => onSelect(action)}
                      disabled={!awaitingAction}
                    />
                  ))}
                </ScrollView>

                {/* 关闭按钮 */}
                <TouchableOpacity
                  style={s.closeBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['#D5CEC0', '#C9C2B4', '#B8B0A0']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                  />
                  <Text style={s.closeBtnText}>关闭</Text>
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
    width: 300,
    maxHeight: '70%',
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
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    textAlign: 'center',
    marginBottom: 6,
  },
  divider: {
    width: '100%',
    height: 1,
    marginBottom: 8,
  },
  list: {
    maxHeight: 320,
  },
  /* 单行 */
  row: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#8B7A5A20',
  },
  rowDisabled: {
    opacity: 0.4,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  rowName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  internalText: {
    color: '#6B5A3A',
  },
  rowSkill: {
    fontSize: 10,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
  },
  internalBadge: {
    backgroundColor: '#6B5A3A20',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 2,
  },
  internalBadgeText: {
    fontSize: 9,
    color: '#6B5A3A',
    fontWeight: '600',
    fontFamily: 'Noto Sans SC',
  },
  rowDesc: {
    fontSize: 12,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    lineHeight: 18,
    marginTop: 3,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  costRow: {
    flexDirection: 'row',
    gap: 4,
  },
  costTag: {
    backgroundColor: '#8B7A5A15',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#8B7A5A30',
  },
  costTagText: {
    fontSize: 9,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
  },
  cooldownTag: {
    backgroundColor: '#A0303015',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#A0303040',
  },
  cooldownTagText: {
    fontSize: 9,
    color: '#A03030',
    fontWeight: '600',
    fontFamily: 'Noto Sans SC',
  },
  closeBtn: {
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B7A5A80',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 10,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 2,
  },
});
