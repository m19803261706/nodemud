/**
 * SkillPage -- 全屏技能页面
 * 上下布局：技能区域(flex:3) + LogScrollView(flex:2)
 * 参照 InventoryPage 布局模式，复用 SkillPanel 的子组件
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import {
  MessageFactory,
  SkillCategory,
  SKILL_SLOT_GROUPS,
} from '@packages/core';
import type { PlayerSkillInfo, SkillSlotType } from '@packages/core';
import { wsService } from '../../../services/WebSocketService';
import { useSkillStore } from '../../../stores/useSkillStore';
import { useGameStore } from '../../../stores/useGameStore';
import { LogScrollView } from '../shared/LogScrollView';
import { BonusSummaryBar } from '../SkillPanel/BonusSummaryBar';
import { SkillCategoryTabs } from '../SkillPanel/SkillCategoryTabs';
import { SkillListItem } from '../SkillPanel/SkillListItem';
import { SkillDetailModal } from '../SkillPanel/SkillDetailModal';

/** 武学子分组配置 */
const MARTIAL_SUBGROUPS: { key: string; label: string }[] = [
  { key: 'weaponMartial', label: '兵刃' },
  { key: 'unarmedMartial', label: '空手' },
  { key: 'movement', label: '身法' },
];

export const SkillPage = () => {
  const skills = useSkillStore(state => state.skills);
  const bonusSummary = useSkillStore(state => state.bonusSummary);
  const sendCommand = useGameStore(state => state.sendCommand);

  /** 当前激活的分类 Tab */
  const [activeTab, setActiveTab] = useState<SkillCategory>(
    SkillCategory.MARTIAL,
  );

  /** 搜索关键词 */
  const [keyword, setKeyword] = useState('');

  /** 技能详情弹窗 */
  const [detailSkillId, setDetailSkillId] = useState<string | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  /** 页面打开时请求最新面板数据 */
  useEffect(() => {
    wsService.send(MessageFactory.create('skillPanelRequest', {}));
  }, []);

  /** 按当前 Tab + 关键词过滤技能列表 */
  const filteredSkills = useMemo(() => {
    let result = skills.filter(s => s.category === activeTab);
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (normalizedKeyword.length > 0) {
      result = result.filter(s =>
        s.skillName.toLowerCase().includes(normalizedKeyword),
      );
    }
    return result;
  }, [skills, activeTab, keyword]);

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

  /** 装配/卸下回调 */
  const handleEquipToggle = useCallback(
    (skill: PlayerSkillInfo) => {
      const cmd = skill.isMapped
        ? `disable ${skill.skillName}`
        : `enable ${skill.skillName}`;
      sendCommand(cmd);
    },
    [sendCommand],
  );

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
          return (
            <SkillListItem
              skill={skill}
              onPress={handleSkillPress}
              onEquipToggle={handleEquipToggle}
            />
          );
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
          <SkillListItem
            skill={item}
            onPress={handleSkillPress}
            onEquipToggle={handleEquipToggle}
          />
        )}
        keyExtractor={item => item.skillId}
        style={s.listView}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={s.container}>
      {/* 上半部分：技能区域 */}
      <View style={s.skillArea}>
        {/* 加成汇总栏 */}
        <View style={s.bonusWrap}>
          <BonusSummaryBar summary={bonusSummary} />
        </View>

        {/* 分类 Tab */}
        <View style={s.tabsWrap}>
          <SkillCategoryTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </View>

        {/* 搜索栏 */}
        <View style={s.searchRow}>
          <TextInput
            value={keyword}
            onChangeText={setKeyword}
            placeholder="搜索技能名称"
            placeholderTextColor="#A79C8C"
            style={s.searchInput}
            returnKeyType="search"
          />
          {keyword.length > 0 ? (
            <TouchableOpacity
              style={s.clearBtn}
              onPress={() => setKeyword('')}
              activeOpacity={0.7}
            >
              <Text style={s.clearText}>清空</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* 技能列表 */}
        <View style={s.listContainer}>
          {activeTab === SkillCategory.MARTIAL
            ? renderMartialList()
            : renderSimpleList()}
        </View>
      </View>

      {/* 下半部分：日志 */}
      <View style={s.logArea}>
        <LogScrollView />
      </View>

      {/* 技能详情弹窗 */}
      <SkillDetailModal
        visible={detailVisible}
        onClose={handleDetailClose}
        skillId={detailSkillId}
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  skillArea: {
    flex: 3,
    backgroundColor: '#F5F0E830',
    borderWidth: 1,
    borderColor: '#8B7A5A30',
  },
  bonusWrap: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  tabsWrap: {
    paddingHorizontal: 12,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 4,
  },
  searchInput: {
    flex: 1,
    height: 30,
    borderWidth: 1,
    borderColor: '#8B7A5A40',
    borderRadius: 3,
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    backgroundColor: '#FFFFFF80',
  },
  clearBtn: {
    height: 30,
    minWidth: 44,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B7A5A50',
    borderRadius: 3,
    backgroundColor: '#F5F0E8',
  },
  clearText: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 12,
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
  logArea: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#8B7A5A30',
    borderTopWidth: 0,
    backgroundColor: '#F5F0E820',
  },
});
