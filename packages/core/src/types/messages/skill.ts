/**
 * 技能系统消息类型定义
 * 包含技能列表、更新、学习、战斗行动、装配、面板、修炼等全部消息接口
 */

import type { ClientMessage, ServerMessage } from '../base';
import type {
  SkillSlotType,
  SkillCategory,
  SkillUpdateReason,
  PracticeMode,
  SkillLearnSource,
} from '../skill-constants';

// ========== 子接口 ==========

/** 玩家技能信息 */
export interface PlayerSkillInfo {
  skillId: string; // 技能 ID
  skillName: string; // 技能名称
  skillType: SkillSlotType; // 技能槽位类型
  category: SkillCategory; // 技能分类
  level: number; // 技能等级
  learned: number; // 已修炼经验
  learnedMax: number; // 升级所需经验
  isMapped: boolean; // 是否已装配到槽位
  mappedSlot: SkillSlotType | null; // 装配的槽位（null 表示未装配）
  isActiveForce: boolean; // 是否为当前激活内功
  isLocked: boolean; // 是否被锁定
}

/** 战斗行动选项 */
export interface CombatActionOption {
  index: number; // 选项索引
  skillId: string; // 技能 ID
  skillName: string; // 技能名称
  actionName: string; // 招式名称
  actionDesc: string; // 招式描述
  lvl: number; // 招式解锁等级
  costs: ResourceCostInfo[]; // 资源消耗
  canUse: boolean; // 是否可用
  isInternal: boolean; // 是否为内功招式
}

/** 资源消耗信息 */
export interface ResourceCostInfo {
  resource: string; // 资源类型（如 mp、energy）
  amount: number; // 消耗量
  current: number; // 当前值
}

/** 技能加成汇总 */
export interface SkillBonusSummary {
  attack: number; // 攻击加成
  defense: number; // 防御加成
  dodge: number; // 闪避加成
  parry: number; // 招架加成
  maxHp: number; // 生命上限加成
  maxMp: number; // 内力上限加成
  critRate: number; // 暴击率加成
  hitRate: number; // 命中率加成
}

/** 技能详情信息 */
export interface SkillDetailInfo {
  skillId: string; // 技能 ID
  skillName: string; // 技能名称
  description: string; // 技能描述
  actions: ActionDetailInfo[]; // 招式列表
}

/** 招式详情信息 */
export interface ActionDetailInfo {
  skillName: string; // 招式名称
  description: string; // 招式描述
  lvl: number; // 解锁等级
  unlocked: boolean; // 是否已解锁
  costs: ResourceCostInfo[]; // 资源消耗
  modifiers: {
    attack: number; // 攻击修正
    damage: number; // 伤害修正
    dodge: number; // 闪避修正
    parry: number; // 招架修正
    damageType: string; // 伤害类型
  };
}

/** 可传授技能摘要（用于师父/授艺面板） */
export interface TeachSkillInfo {
  skillId: string; // 技能 ID
  skillName: string; // 技能名称
  skillType: SkillSlotType; // 技能槽位类型
  category: SkillCategory; // 技能分类
  level: number; // 授艺者当前演示等级
}

/** 师父传艺目录（技能页快捷学艺入口） */
export interface MasterTeachData {
  npcId: string; // 师父 NPC 蓝图 ID（如 npc/songyang/master-li）
  npcName: string; // 师父姓名
  sectId: string; // 门派 ID
  sectName: string; // 门派名
  skills: TeachSkillInfo[]; // 可传授技能
}

// ========== 服务端 → 客户端消息 ==========

/** skillList 消息数据 — 技能列表全量推送 */
export interface SkillListData {
  skills: PlayerSkillInfo[]; // 全部技能列表
  skillMap: Record<string, string>; // 槽位 → 技能 ID 映射
  activeForce: string | null; // 当前激活内功 ID
}

/** skillList 消息 */
export interface SkillListMessage extends ServerMessage {
  type: 'skillList';
  data: SkillListData;
}

/** skillUpdate 消息数据 — 单个技能增量更新 */
export interface SkillUpdateData {
  skillId: string; // 技能 ID
  changes: Partial<PlayerSkillInfo>; // 变更字段
  reason: SkillUpdateReason; // 更新原因
}

/** skillUpdate 消息 */
export interface SkillUpdateMessage extends ServerMessage {
  type: 'skillUpdate';
  data: SkillUpdateData;
}

/** skillLearn 消息数据 — 学会新技能通知 */
export interface SkillLearnData {
  skillId: string; // 技能 ID
  skillName: string; // 技能名称
  skillType: SkillSlotType; // 技能槽位类型
  category: SkillCategory; // 技能分类
  source: SkillLearnSource; // 学习来源
  message: string; // 提示信息
}

/** skillLearn 消息 */
export interface SkillLearnMessage extends ServerMessage {
  type: 'skillLearn';
  data: SkillLearnData;
}

/** combatAwaitAction 消息数据 — 等待玩家选择战斗行动 */
export interface CombatAwaitActionData {
  combatId: string; // 战斗 ID
  timeoutMs: number; // 超时时间（ms）
  availableActions: CombatActionOption[]; // 可用行动列表
}

/** combatAwaitAction 消息 */
export interface CombatAwaitActionMessage extends ServerMessage {
  type: 'combatAwaitAction';
  data: CombatAwaitActionData;
}

/** skillMapResult 消息数据 — 技能装配结果 */
export interface SkillMapResultData {
  success: boolean; // 是否成功
  slotType: SkillSlotType; // 槽位类型
  skillId: string | null; // 技能 ID（null 表示卸下）
  skillName: string | null; // 技能名称
  message: string; // 提示信息
  updatedMap: Record<string, string>; // 更新后的完整映射
}

/** skillMapResult 消息 */
export interface SkillMapResultMessage extends ServerMessage {
  type: 'skillMapResult';
  data: SkillMapResultData;
}

/** skillPanelData 消息数据 — 技能面板完整数据 */
export interface SkillPanelDataResponse {
  skills: PlayerSkillInfo[]; // 全部技能列表
  skillMap: Record<string, string>; // 槽位映射
  activeForce: string | null; // 当前激活内功 ID
  bonusSummary: SkillBonusSummary; // 技能加成汇总
  detail?: SkillDetailInfo; // 技能详情（可选）
  masterTeach?: MasterTeachData | null; // 当前师父可传授目录（可选）
}

/** skillPanelData 消息 */
export interface SkillPanelDataMessage extends ServerMessage {
  type: 'skillPanelData';
  data: SkillPanelDataResponse;
}

/** practiceUpdate 消息数据 — 修炼进度更新 */
export interface PracticeUpdateData {
  skillId: string; // 技能 ID
  skillName: string; // 技能名称
  mode: PracticeMode; // 修炼模式
  currentLevel: number; // 当前等级
  learned: number; // 已修炼经验
  learnedMax: number; // 升级所需经验
  levelUp: boolean; // 是否刚升级
  message: string; // 提示信息
  resourceCost: ResourceCostInfo | null; // 资源消耗（null 表示无消耗）
  stopped: boolean; // 是否已停止
}

/** practiceUpdate 消息 */
export interface PracticeUpdateMessage extends ServerMessage {
  type: 'practiceUpdate';
  data: PracticeUpdateData;
}

/** skillLearnResult 消息数据 — NPC 学艺结果 */
export type SkillLearnFailureReason =
  | 'unlock_rank_required'
  | 'unlock_attr_required'
  | 'unlock_preq_skill_required'
  | 'unlock_puzzle_canju_required'
  | 'unlock_puzzle_duanju_required'
  | 'unlock_puzzle_shiyan_required'
  | 'unlock_challenge_required'
  | 'canon_crippled'
  | 'insufficient_silver'
  | 'insufficient_energy'
  | 'insufficient_potential'
  | 'teacher_cap_reached'
  | 'cannot_improve';

export interface SkillLearnResultData {
  success: boolean; // 是否成功
  skillId: string; // 技能 ID
  skillName: string; // 技能名称
  timesCompleted: number; // 已完成次数
  timesRequested: number; // 请求次数
  currentLevel: number; // 当前等级
  learned: number; // 已修炼经验
  learnedMax: number; // 升级所需经验
  levelUp: boolean; // 是否刚升级
  message: string; // 提示信息
  reason?: SkillLearnFailureReason; // 失败原因（可选）
}

/** skillLearnResult 消息 */
export interface SkillLearnResultMessage extends ServerMessage {
  type: 'skillLearnResult';
  data: SkillLearnResultData;
}

// ========== 客户端 → 服务端消息 ==========

/** skillUse 消息数据 — 玩家选择战斗行动 */
export interface SkillUseData {
  combatId: string; // 战斗 ID
  actionIndex: number; // 行动选项索引
}

/** skillUse 消息 */
export interface SkillUseMessage extends ClientMessage {
  type: 'skillUse';
  data: SkillUseData;
}

/** skillMapRequest 消息数据 — 请求装配/卸下技能 */
export interface SkillMapRequestData {
  slotType: SkillSlotType; // 槽位类型
  skillId: string | null; // 技能 ID（null 表示卸下）
}

/** skillMapRequest 消息 */
export interface SkillMapRequestMessage extends ClientMessage {
  type: 'skillMapRequest';
  data: SkillMapRequestData;
}

/** skillPanelRequest 消息数据 — 请求技能面板数据 */
export interface SkillPanelRequestData {
  detailSkillId?: string; // 需要详情的技能 ID（可选）
}

/** skillPanelRequest 消息 */
export interface SkillPanelRequestMessage extends ClientMessage {
  type: 'skillPanelRequest';
  data: SkillPanelRequestData;
}

/** practiceStart 消息数据 — 开始修炼 */
export interface PracticeStartData {
  skillId: string; // 技能 ID
  mode: PracticeMode; // 修炼模式
}

/** practiceStart 消息 */
export interface PracticeStartMessage extends ClientMessage {
  type: 'practiceStart';
  data: PracticeStartData;
}

/** practiceEnd 消息数据 — 结束修炼 */
export interface PracticeEndData {
  reason: 'manual' | 'exhausted'; // 结束原因
}

/** practiceEnd 消息 */
export interface PracticeEndMessage extends ClientMessage {
  type: 'practiceEnd';
  data: PracticeEndData;
}

/** skillLearnRequest 消息数据 — 请求 NPC 学艺 */
export interface SkillLearnRequestData {
  npcId: string; // NPC ID
  skillId: string; // 技能 ID
  times: number; // 学习次数
}

/** skillLearnRequest 消息 */
export interface SkillLearnRequestMessage extends ClientMessage {
  type: 'skillLearnRequest';
  data: SkillLearnRequestData;
}
