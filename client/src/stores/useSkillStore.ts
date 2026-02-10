/**
 * 技能系统独立 Store — Zustand
 * 管理玩家技能列表、槽位映射、内功激活、加成汇总、修炼进度等状态
 * 独立于 useGameStore，避免技能变更触发无关组件重渲染
 */

import { create } from 'zustand';
import type {
  PlayerSkillInfo,
  SkillBonusSummary,
  SkillListData,
  SkillUpdateData,
  SkillLearnData,
  SkillMapResultData,
  SkillPanelDataResponse,
  PracticeUpdateData,
  SkillLearnResultData,
  SkillDetailInfo,
} from '@packages/core';

/* ─── 修炼状态 ─── */

/** 当前修炼进度 */
export interface PracticeState {
  /** 是否正在修炼 */
  active: boolean;
  /** 修炼的技能 ID */
  skillId: string | null;
  /** 修炼的技能名称 */
  skillName: string | null;
  /** 修炼模式 */
  mode: string | null;
  /** 当前等级 */
  currentLevel: number;
  /** 已修炼经验 */
  learned: number;
  /** 升级所需经验 */
  learnedMax: number;
}

/* ─── Store 接口 ─── */

export interface SkillState {
  /** 技能列表 */
  skills: PlayerSkillInfo[];
  /** 槽位 → 技能 ID 映射 */
  skillMap: Record<string, string>;
  /** 当前激活内功 ID */
  activeForce: string | null;
  /** 技能加成汇总 */
  bonusSummary: SkillBonusSummary | null;
  /** 修炼进度 */
  practiceState: PracticeState;
  /** 技能详情（面板展开时使用） */
  skillDetail: SkillDetailInfo | null;

  // ─── Actions ───

  /** 全量设置技能列表（登录/进入游戏时调用） */
  setSkillList: (data: SkillListData) => void;
  /** 增量更新单个技能 */
  updateSkill: (data: SkillUpdateData) => void;
  /** 新增一个学会的技能 */
  addSkill: (data: SkillLearnData) => void;
  /** 设置槽位映射（装配/卸下结果） */
  setSkillMap: (data: SkillMapResultData) => void;
  /** 设置技能加成汇总 */
  setBonusSummary: (summary: SkillBonusSummary) => void;
  /** 更新面板完整数据 */
  setSkillPanelData: (data: SkillPanelDataResponse) => void;
  /** 更新修炼进度 */
  updatePractice: (data: PracticeUpdateData) => void;
  /** 更新学艺结果 */
  applyLearnResult: (data: SkillLearnResultData) => void;
  /** 设置技能详情 */
  setSkillDetail: (detail: SkillDetailInfo | null) => void;
}

/* ─── 修炼初始状态 ─── */

const INITIAL_PRACTICE: PracticeState = {
  active: false,
  skillId: null,
  skillName: null,
  mode: null,
  currentLevel: 0,
  learned: 0,
  learnedMax: 0,
};

/* ─── Store ─── */

export const useSkillStore = create<SkillState>((set, get) => ({
  skills: [],
  skillMap: {},
  activeForce: null,
  bonusSummary: null,
  practiceState: INITIAL_PRACTICE,
  skillDetail: null,

  // 全量设置技能列表
  setSkillList: (data: SkillListData) =>
    set({
      skills: data.skills,
      skillMap: data.skillMap,
      activeForce: data.activeForce,
    }),

  // 增量更新单个技能
  updateSkill: (data: SkillUpdateData) =>
    set(state => {
      const skills = state.skills.map(s =>
        s.skillId === data.skillId ? { ...s, ...data.changes } : s,
      );
      // 如果更新涉及内功激活，同步 activeForce
      let { activeForce } = state;
      if (data.changes.isActiveForce === true) {
        activeForce = data.skillId;
      } else if (
        data.changes.isActiveForce === false &&
        state.activeForce === data.skillId
      ) {
        activeForce = null;
      }
      return { skills, activeForce };
    }),

  // 新增一个学会的技能
  addSkill: (data: SkillLearnData) =>
    set(state => {
      // 避免重复添加
      const exists = state.skills.some(s => s.skillId === data.skillId);
      if (exists) return state;
      // 构造新技能条目（初始等级 0，未装配）
      const newSkill: PlayerSkillInfo = {
        skillId: data.skillId,
        skillName: data.skillName,
        skillType: data.skillType,
        category: data.category,
        level: 0,
        learned: 0,
        learnedMax: 1, // (0+1)^2 = 1
        isMapped: false,
        mappedSlot: null,
        isActiveForce: false,
        isLocked: false,
      };
      return { skills: [...state.skills, newSkill] };
    }),

  // 设置槽位映射
  setSkillMap: (data: SkillMapResultData) =>
    set(state => {
      // 更新完整映射表
      const skillMap = { ...data.updatedMap };
      // 找出 updatedMap 中所有已映射的技能 ID
      const mappedSkillIds = new Set(Object.values(skillMap));
      // 同步更新技能列表中所有技能的映射状态
      const skills = state.skills.map(s => {
        if (mappedSkillIds.has(s.skillId)) {
          // 该技能在映射表中，找到对应的槽位
          const slot = Object.entries(skillMap).find(
            ([, id]) => id === s.skillId,
          );
          return { ...s, isMapped: true, mappedSlot: slot ? slot[0] : null };
        }
        // 该技能不在映射表中，如果之前是映射的则清除
        if (s.isMapped) {
          return { ...s, isMapped: false, mappedSlot: null };
        }
        return s;
      });
      return { skillMap, skills };
    }),

  // 设置技能加成汇总
  setBonusSummary: (summary: SkillBonusSummary) =>
    set({ bonusSummary: summary }),

  // 更新面板完整数据
  setSkillPanelData: (data: SkillPanelDataResponse) =>
    set({
      skills: data.skills,
      skillMap: data.skillMap,
      activeForce: data.activeForce,
      bonusSummary: data.bonusSummary,
      skillDetail: data.detail ?? null,
    }),

  // 更新修炼进度
  updatePractice: (data: PracticeUpdateData) =>
    set(state => {
      // 更新修炼状态
      const practiceState: PracticeState = {
        active: !data.stopped,
        skillId: data.skillId,
        skillName: data.skillName,
        mode: data.mode,
        currentLevel: data.currentLevel,
        learned: data.learned,
        learnedMax: data.learnedMax,
      };
      // 同步更新技能列表中对应技能的经验数据
      const skills = state.skills.map(s =>
        s.skillId === data.skillId
          ? {
              ...s,
              level: data.currentLevel,
              learned: data.learned,
              learnedMax: data.learnedMax,
            }
          : s,
      );
      return { practiceState, skills };
    }),

  // 更新学艺结果
  applyLearnResult: (data: SkillLearnResultData) =>
    set(state => {
      if (!data.success) return state;

      // 同步更新技能列表中对应技能的经验数据
      const skills = state.skills.map(s =>
        s.skillId === data.skillId
          ? {
              ...s,
              level: data.currentLevel,
              learned: data.learned,
              learnedMax: data.learnedMax,
            }
          : s,
      );
      return { skills };
    }),

  // 设置技能详情
  setSkillDetail: (detail: SkillDetailInfo | null) =>
    set({ skillDetail: detail }),
}));
