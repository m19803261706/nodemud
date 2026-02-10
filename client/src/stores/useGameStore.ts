/**
 * 游戏全局状态 — Zustand Store
 * 所有游戏 UI 组件通过 selector 取自己需要的数据切片
 */

import { create } from 'zustand';
import type {
  InventoryItem,
  ItemBrief,
  EquipmentData,
  EquipmentBonus,
  CombatFighter,
  CombatAction,
  CombatStartData,
  CombatUpdateData,
  CombatEndData,
  QuestObjectiveProgress,
} from '@packages/core';
import { wsService } from '../services/WebSocketService';

/* ─── 类型定义 ─── */

/** 运行时资源值（进度条用） */
export interface ResourceValue {
  current: number;
  max: number;
}

/** 六维属性 */
export interface CharacterAttrs {
  wisdom: number;
  perception: number;
  spirit: number;
  meridian: number;
  strength: number;
  vitality: number;
}

/** 攻防数值 */
export interface CombatData {
  attack: number;
  defense: number;
}

/** 玩家数据（来自服务端 playerStats 消息） */
export interface PlayerData {
  name: string;
  level: number;
  levelTitle: string;
  silver: number;
  hp: ResourceValue;
  mp: ResourceValue;
  energy: ResourceValue;
  attrs: CharacterAttrs;
  equipBonus: EquipmentBonus;
  combat: CombatData;
  exp: number;
  expToNextLevel: number;
  potential: number;
  score: number;
  freePoints: number;
}

export interface LogEntry {
  id: number;
  text: string;
  color: string;
  timestamp: number;
}

/** appendLog 入参类型（id/timestamp 自动生成） */
export type LogEntryInput = Omit<LogEntry, 'id' | 'timestamp'>;

let logIdCounter = 0;

export interface ChatMessage {
  text: string;
  color: string;
}

export interface Direction {
  text: string;
  bold: boolean;
  center?: boolean;
}

export interface NpcData {
  id: string;
  name: string;
  title: string;
  gender: string;
  faction: string;
  level: number;
  hpPct: number;
  attitude: string;
  hasQuest?: boolean;
  hasQuestReady?: boolean;
}

/** NPC 装备条目 */
export interface NpcEquipmentItem {
  position: string;
  name: string;
  quality: number;
}

/** 物品详情数据（弹窗用，从 commandResult.data 获取） */
export interface ItemDetailData {
  containerId?: string;
  containerName?: string;
  isRemains?: boolean;
  contents?: ItemBrief[];
  // 普通物品字段
  itemId?: string;
  name?: string;
  long?: string;
  type?: string;
  weight?: number;
  value?: number;
}

/** NPC 任务摘要（NPC look 返回用） */
export interface NpcQuestBrief {
  questId: string;
  name: string;
  description: string;
  state: 'available' | 'active' | 'ready';
  objectives?: QuestObjectiveProgress[];
}

/** 商店货单条目 */
export interface ShopGoodView {
  index: number;
  blueprintId: string;
  name: string;
  short: string;
  price: number;
  stock: number;
}

/** 货单详情（list 指令返回） */
export interface ShopListDetail {
  merchantId: string;
  merchantName: string;
  goods: ShopGoodView[];
}

/** NPC 详情数据（弹窗用，从 commandResult.data 获取） */
export interface NpcDetailData {
  npcId: string;
  name: string;
  title: string;
  gender: string;
  faction: string;
  level: number;
  hpPct: number;
  attitude: string;
  short: string;
  long: string;
  equipment?: NpcEquipmentItem[];
  actions?: string[];
  capabilities?: {
    chat?: boolean;
    give?: boolean;
    attack?: boolean;
    shopList?: boolean;
    shopSell?: boolean;
    /** 兼容旧服务端字段 */
    shop?: boolean;
    /** NPC 可交互任务列表 */
    quests?: NpcQuestBrief[];
  };
}

/** 进行中的任务信息 */
export interface ActiveQuestInfo {
  questId: string;
  name: string;
  description: string;
  type: 'deliver' | 'capture' | 'collect' | 'dialogue';
  giverNpcName: string;
  status: 'active' | 'ready';
  objectives: QuestObjectiveProgress[];
  acceptedAt: number;
}

/** 已完成的任务信息 */
export interface CompletedQuestInfo {
  questId: string;
  name: string;
}

/** 任务状态切片 */
export interface QuestState {
  active: ActiveQuestInfo[];
  completed: CompletedQuestInfo[];
}

export interface GameState {
  // 玩家
  player: PlayerData;
  updatePlayer: (data: Partial<PlayerData>) => void;

  // 地点
  location: { name: string; actions: string[]; description: string };
  setLocation: (loc: GameState['location']) => void;

  // 地图描述开关
  showMapDesc: boolean;
  toggleMapDesc: () => void;

  // 日志
  gameLog: LogEntry[];
  appendLog: (entry: LogEntryInput) => void;
  clearLog: () => void;

  // 聊天
  chatMessages: ChatMessage[];
  appendChat: (msg: ChatMessage) => void;

  // 方向
  directions: Direction[][];
  setDirections: (dirs: Direction[][]) => void;

  // NPC
  nearbyNpcs: NpcData[];
  setNpcs: (npcs: NpcData[]) => void;

  // NPC 详情弹窗
  npcDetail: NpcDetailData | null;
  setNpcDetail: (detail: NpcDetailData | null) => void;

  // 货单弹窗
  shopListDetail: ShopListDetail | null;
  setShopListDetail: (detail: ShopListDetail | null) => void;
  applyShopBuyResult: (data: {
    merchantId?: string;
    blueprintId?: string;
    stockLeft?: number;
  }) => void;

  // 背包
  inventory: InventoryItem[];
  setInventory: (items: InventoryItem[]) => void;

  // 装备栏
  equipment: EquipmentData;
  setEquipment: (eq: EquipmentData) => void;

  // 地面物品
  groundItems: ItemBrief[];
  setGroundItems: (items: ItemBrief[]) => void;

  // 物品详情弹窗（容器/普通物品）
  itemDetail: ItemDetailData | null;
  setItemDetail: (detail: ItemDetailData | null) => void;

  // 任务
  quests: QuestState;
  setQuests: (quests: QuestState) => void;
  questModalVisible: boolean;
  setQuestModalVisible: (visible: boolean) => void;

  // 指令
  sendCommand: (input: string) => void;

  // 战斗
  combat: {
    active: boolean;
    combatId: string | null;
    player: CombatFighter | null;
    enemy: CombatFighter | null;
    log: CombatAction[];
    result: CombatEndData | null;
  };
  setCombatStart: (data: CombatStartData) => void;
  setCombatUpdate: (data: CombatUpdateData) => void;
  setCombatEnd: (data: CombatEndData) => void;
  clearCombat: () => void;

  // 导航
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

/* ─── Mock 初始数据（与设计稿一致）─── */

/** 玩家属性空初始值 */
const EMPTY_ATTRS: CharacterAttrs = {
  wisdom: 0,
  perception: 0,
  spirit: 0,
  meridian: 0,
  strength: 0,
  vitality: 0,
};

const INITIAL_PLAYER: PlayerData = {
  name: '',
  level: 0,
  levelTitle: '',
  silver: 0,
  hp: { current: 0, max: 0 },
  mp: { current: 0, max: 0 },
  energy: { current: 0, max: 0 },
  attrs: EMPTY_ATTRS,
  equipBonus: {},
  combat: { attack: 0, defense: 0 },
  exp: 0,
  expToNextLevel: 0,
  potential: 0,
  score: 0,
  freePoints: 0,
};

const INITIAL_LOG: LogEntry[] = [];

const INITIAL_CHAT: ChatMessage[] = [];

const INITIAL_DIRECTIONS: Direction[][] = [
  [
    { text: '西北', bold: false },
    { text: '北', bold: true },
    { text: '东北', bold: false },
  ],
  [
    { text: '西', bold: true },
    { text: '中', bold: true, center: true },
    { text: '东', bold: true },
  ],
  [
    { text: '西南', bold: false },
    { text: '南', bold: true },
    { text: '东南', bold: false },
  ],
];

/* ─── exits → directions 转换 ─── */

/** 方向布局：3x3 网格，英文 key → 中文显示 */
const DIR_GRID: [string, string][][] = [
  [
    ['northwest', '西北'],
    ['north', '北'],
    ['northeast', '东北'],
  ],
  [
    ['west', '西'],
    ['center', '中'],
    ['east', '东'],
  ],
  [
    ['southwest', '西南'],
    ['south', '南'],
    ['southeast', '东南'],
  ],
];

/** 根据可走方向列表生成 Direction[][]，中心格显示地点名，有出口的方向显示目标房间名 */
export function exitsToDirections(
  exits: string[],
  locationName?: string,
  exitNames?: Record<string, string>,
): Direction[][] {
  const exitSet = new Set(exits);
  return DIR_GRID.map(row =>
    row.map(([key, text]) => {
      if (key === 'center') {
        return { text: locationName || text, bold: true, center: true };
      }
      const hasExit = exitSet.has(key);
      // 有出口时显示目标房间名，否则显示方向中文
      const displayText = hasExit && exitNames?.[key] ? exitNames[key] : text;
      return { text: displayText, bold: hasExit };
    }),
  );
}

/* ─── Store ─── */

export const useGameStore = create<GameState>(set => ({
  // 玩家
  player: INITIAL_PLAYER,
  updatePlayer: data =>
    set(state => ({ player: { ...state.player, ...data } })),

  // 地点
  location: {
    name: '冰 道',
    actions: ['回城', '飞行', '地图', '邮件'],
    description:
      '凌霄城冰道，四面皆是晶莹剔透的冰壁，寒气从脚下透上来，呼吸间可见白雾。道路两旁挂着数盏冰灯，幽幽蓝光映照在冰面上，折射出点点星芒。远处隐约传来风声，似有低吟浅唱，不知是风穿冰隙还是哪位前辈遗留的阵法余音。脚下的冰面光滑如镜，稍不留神便会滑倒，需得小心翼翼方能前行。',
  },
  setLocation: loc => set({ location: loc }),

  // 地图描述开关
  showMapDesc: false,
  toggleMapDesc: () => set(state => ({ showMapDesc: !state.showMapDesc })),

  // 日志
  gameLog: INITIAL_LOG,
  appendLog: entry =>
    set(state => ({
      gameLog: [
        ...state.gameLog,
        { ...entry, id: ++logIdCounter, timestamp: Date.now() },
      ],
    })),
  clearLog: () => set({ gameLog: [] }),

  // 聊天
  chatMessages: INITIAL_CHAT,
  appendChat: msg =>
    set(state => ({ chatMessages: [...state.chatMessages, msg] })),

  // 方向
  directions: INITIAL_DIRECTIONS,
  setDirections: dirs => set({ directions: dirs }),

  // NPC
  nearbyNpcs: [],
  setNpcs: npcs => set({ nearbyNpcs: npcs }),

  // NPC 详情弹窗
  npcDetail: null,
  setNpcDetail: detail => set({ npcDetail: detail }),

  // 货单弹窗
  shopListDetail: null,
  setShopListDetail: detail => set({ shopListDetail: detail }),
  applyShopBuyResult: data =>
    set(state => {
      const current = state.shopListDetail;
      if (!current || !data.merchantId || current.merchantId !== data.merchantId) {
        return state;
      }
      if (!data.blueprintId || typeof data.stockLeft !== 'number') {
        return state;
      }

      let updated = false;
      const goods = current.goods.map(good => {
        if (!updated && good.blueprintId === data.blueprintId) {
          updated = true;
          return { ...good, stock: data.stockLeft! };
        }
        return good;
      });

      if (!updated) return state;
      return { shopListDetail: { ...current, goods } };
    }),

  // 背包
  inventory: [],
  setInventory: items => set({ inventory: items }),

  // 装备栏
  equipment: {
    head: null,
    body: null,
    hands: null,
    feet: null,
    waist: null,
    weapon: null,
    offhand: null,
    neck: null,
    finger: null,
    wrist: null,
  },
  setEquipment: eq => set({ equipment: eq }),

  // 地面物品
  groundItems: [],
  setGroundItems: items => set({ groundItems: items }),
  itemDetail: null,
  setItemDetail: detail => set({ itemDetail: detail }),

  // 任务
  quests: { active: [], completed: [] },
  setQuests: quests => set({ quests }),
  questModalVisible: false,
  setQuestModalVisible: visible => set({ questModalVisible: visible }),

  // 指令
  sendCommand: (input: string) => {
    const msg = { type: 'command', data: { input }, timestamp: Date.now() };
    wsService.send(msg);
  },

  // 战斗
  combat: {
    active: false,
    combatId: null,
    player: null,
    enemy: null,
    log: [],
    result: null,
  },
  setCombatStart: data =>
    set({
      combat: {
        active: true,
        combatId: data.combatId,
        player: data.player,
        enemy: data.enemy,
        log: [],
        result: null,
      },
    }),
  setCombatUpdate: data =>
    set(state => ({
      combat: {
        ...state.combat,
        player: state.combat.player
          ? { ...state.combat.player, ...data.player }
          : null,
        enemy: state.combat.enemy
          ? { ...state.combat.enemy, ...data.enemy }
          : null,
        log: [...state.combat.log, ...data.actions],
      },
    })),
  setCombatEnd: data =>
    set(state => ({
      combat: {
        ...state.combat,
        active: false,
        result: data,
      },
    })),
  clearCombat: () =>
    set({
      combat: {
        active: false,
        combatId: null,
        player: null,
        enemy: null,
        log: [],
        result: null,
      },
    }),

  // 导航
  activeTab: '江湖',
  setActiveTab: tab => set({ activeTab: tab }),
}));
