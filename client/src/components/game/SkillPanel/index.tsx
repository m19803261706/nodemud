/**
 * SkillPanel -- 技能面板容器
 * Modal 形式，从底部弹出
 * 从 useSkillStore 取数据，顶部加成汇总 + 分类 Tab + 技能列表
 * 打开时发送 skillPanelRequest 获取最新数据
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import LinearGradient from '../../LinearGradient';
import { GradientDivider } from '../shared';
import {
  MessageFactory,
  SkillCategory,
  SKILL_SLOT_GROUPS,
} from '@packages/core';
import type { PlayerSkillInfo, SkillSlotType, SkillBonusSummary } from '@packages/core';
import { wsService } from '../../../services/WebSocketService';
import { useSkillStore } from '../../../stores/useSkillStore';
import { BonusSummaryBar } from './BonusSummaryBar';
import { SkillCategoryTabs } from './SkillCategoryTabs';
import { SkillListItem } from './SkillListItem';
import { SkillDetailModal } from './SkillDetailModal';

interface SkillPanelProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  skillsOverride?: PlayerSkillInfo[] | null;
  bonusSummaryOverride?: SkillBonusSummary | null;
  /** 只读目录模式：保留目录浏览，仅禁用详情中的装配交互 */
  readOnlyCatalog?: boolean;
  /** 详情弹窗外部动作（如“学习技能”） */
  detailActionLabel?: string;
  onDetailActionPress?: (skillId: string) => void;
}

/** 武学子分组配置 */
const MARTIAL_SUBGROUPS: { key: string; label: string }[] = [
  { key: 'weaponMartial', label: '兵刃' },
  { key: 'unarmedMartial', label: '空手' },
  { key: 'movement', label: '身法' },
];

export const SkillPanel = ({
  visible,
  onClose,
  title = '技能',
  skillsOverride = null,
  bonusSummaryOverride = null,
  readOnlyCatalog = false,
  detailActionLabel,
  onDetailActionPress,
}: SkillPanelProps) => {
  const playerSkills = useSkillStore(state => state.skills);
  const playerBonusSummary = useSkillStore(state => state.bonusSummary);
  const usingOverride = Array.isArray(skillsOverride);
  const skills = usingOverride ? skillsOverride : playerSkills;
  const bonusSummary = usingOverride ? bonusSummaryOverride : playerBonusSummary;

  /** 当前激活的分类 Tab */
  const [activeTab, setActiveTab] = useState<SkillCategory>(
    SkillCategory.MARTIAL,
  );

  /** 技能详情弹窗 */
  const [detailSkillId, setDetailSkillId] = useState<string | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  /** 打开时请求最新面板数据 */
  useEffect(() => {
    if (visible && !usingOverride) {
      wsService.send(MessageFactory.create('skillPanelRequest', {}));
    }
  }, [visible, usingOverride]);

  /** 按当前 Tab 过滤技能列表 */
  const filteredSkills = skills.filter(s => s.category === activeTab);

  /** 武学分类按子分组排列（带分组标题） */
  const buildMartialSections = useCallback((): {
    type: 'header' | 'skill';
    data: string | PlayerSkillInfo;
  }[] => {
    const result: {
      type: 'header' | 'skill';
      data: string | PlayerSkillInfo;
    }[] = [];
    for (const group of MARTIAL_SUBGROUPS) {
      const slotTypes = SKILL_SLOT_GROUPS[group.key] || [];
      const groupSkills = filteredSkills.filter(s =>
        slotTypes.includes(s.skillType as SkillSlotType),
      );
      if (groupSkills.length > 0) {
        result.push({ type: 'header', data: group.label });
        for (const sk of groupSkills) {
          result.push({ type: 'skill', data: sk });
        }
      }
    }
    return result;
  }, [filteredSkills]);

  /** 点击技能 - 打开详情弹窗 */
  const handleSkillPress = useCallback((skillId: string) => {
    setDetailSkillId(skillId);
    setDetailVisible(true);
  }, []);

  /** 关闭详情弹窗 */
  const handleDetailClose = useCallback(() => {
    setDetailVisible(false);
    setDetailSkillId(null);
  }, []);

  /** 渲染武学分类列表（带分组标题） */
  const renderMartialList = () => {
    const sections = buildMartialSections();
    if (sections.length === 0) {
      return <Text style={s.emptyText}>暂无此类技能</Text>;
    }
    return (
      <FlatList
        data={sections}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <View style={s.subGroupHeader}>
                <Text style={s.subGroupTitle}>{item.data as string}</Text>
              </View>
            );
          }
          const skill = item.data as PlayerSkillInfo;
          return <SkillListItem skill={skill} onPress={handleSkillPress} />;
        }}
        keyExtractor={(item, idx) =>
          item.type === 'header'
            ? `hdr-${item.data}`
            : `sk-${(item.data as PlayerSkillInfo).skillId}-${idx}`
        }
        style={s.listView}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  /** 渲染普通分类列表（无子分组） */
  const renderSimpleList = () => {
    if (filteredSkills.length === 0) {
      return <Text style={s.emptyText}>暂无此类技能</Text>;
    }
    return (
      <FlatList
        data={filteredSkills}
        renderItem={({ item }) => (
          <SkillListItem skill={item} onPress={handleSkillPress} />
        )}
        keyExtractor={item => item.skillId}
        style={s.listView}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <View style={s.card}>
          {/* 渐变背景 */}
          <LinearGradient
            colors={['#F5F0E8', '#EBE5DA', '#E0D9CC', '#D5CEC0']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
          <View style={s.borderOverlay} pointerEvents="none" />

          {/* 头部标题栏 */}
          <View style={s.header}>
            <Text style={s.headerTitle}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={s.closeBtn}
              activeOpacity={0.7}
            >
              <Text style={s.closeBtnText}>&#10005;</Text>
            </TouchableOpacity>
          </View>

          <View style={s.headerDivider}>
            <GradientDivider />
          </View>

          {/* 加成汇总栏 */}
          {bonusSummary ? (
            <View style={s.bonusWrap}>
              <BonusSummaryBar summary={bonusSummary} />
            </View>
          ) : null}

          {/* 分类 Tab */}
          <View style={s.tabsWrap}>
            <SkillCategoryTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </View>

          {/* 技能列表 */}
          <View style={s.listContainer}>
            {activeTab === SkillCategory.MARTIAL
              ? renderMartialList()
              : renderSimpleList()}
          </View>
        </View>
      </View>

      {/* 嵌套: 技能详情弹窗 */}
      <SkillDetailModal
        visible={detailVisible}
        onClose={handleDetailClose}
        skillId={detailSkillId}
        showEquipToggle={!readOnlyCatalog}
        actionLabel={detailActionLabel}
        onActionPress={onDetailActionPress}
        embedded
      />
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  card: {
    width: '100%',
    height: '82%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: '#8B7A5A40',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 2,
  },
  closeBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: '#8B7A5A',
    fontFamily: 'Noto Sans SC',
  },
  headerDivider: {
    paddingHorizontal: 18,
  },
  bonusWrap: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 6,
  },
  tabsWrap: {
    paddingHorizontal: 18,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 18,
  },
  listView: {
    flex: 1,
  },
  subGroupHeader: {
    paddingTop: 10,
    paddingBottom: 4,
    paddingHorizontal: 2,
  },
  subGroupTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 1,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#A09888',
    fontFamily: 'Noto Serif SC',
    paddingVertical: 30,
  },
});
