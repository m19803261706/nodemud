/**
 * 游戏全局状态 — Zustand Store
 * 所有游戏 UI 组件通过 selector 取自己需要的数据切片
 */

import { create } from 'zustand';
import { wsService } from '../services/WebSocketService';

/* ─── 类型定义 ─── */

export interface StatData {
  label: string;
  value: string;
  pct: number;
  color: string;
}

export interface LogEntry {
  text: string;
  color: string;
}

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
  name: string;
  nameColor: string;
  gender: string;
  genderColor: string;
  level: string;
  hpPct: number;
  hpColor: string;
  borderColor: string;
}

export interface GameState {
  // 玩家
  player: { name: string; level: string; stats: StatData[][] };
  updatePlayer: (data: Partial<GameState['player']>) => void;

  // 地点
  location: { name: string; actions: string[]; description: string };
  setLocation: (loc: GameState['location']) => void;

  // 地图描述开关
  showMapDesc: boolean;
  toggleMapDesc: () => void;

  // 日志
  gameLog: LogEntry[];
  appendLog: (entry: LogEntry) => void;
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

  // 指令
  sendCommand: (input: string) => void;

  // 导航
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

/* ─── Mock 初始数据（与设计稿一致）─── */

const INITIAL_STATS: StatData[][] = [
  [
    { label: '气血', value: '1280/1500', pct: 85, color: '#A65D5D' },
    { label: '内力', value: '850/1000', pct: 85, color: '#4A6B6B' },
    { label: '经验', value: '78%', pct: 78, color: '#8B7355' },
  ],
  [
    { label: '潜能', value: '2450', pct: 60, color: '#6B8A5A' },
    { label: '技能', value: '32/50', pct: 64, color: '#5A6B8A' },
    { label: '银两', value: '12,580', pct: 45, color: '#8B7A14' },
  ],
];

const INITIAL_LOG: LogEntry[] = [
  { text: '你从梅道来到了冰道。', color: '#3D3935' },
  { text: '此处乃凌霄城之冰道，寒气逼人，四周结满冰霜。', color: '#5A5550' },
  {
    text: '凌霄弟子道：「施主远道而来，不知有何贵干？」',
    color: '#2B5A3A',
  },
  { text: '【系统】你获得了一百经验值。', color: '#8B6B14' },
  { text: '【战斗】凌霄弟子对你发动攻击！', color: '#8B3A3A' },
  {
    text: '你施展「太极剑法」反击，造成二百三十伤害。',
    color: '#3A5A6B',
  },
  { text: '【闲聊】逍遥剑客：有人组队下副本吗？', color: '#6B5A8B' },
  { text: '凌霄弟子倒地不起，你获得了胜利。', color: '#3D3935' },
  { text: '【门派】掌门人：今晚八点举行门派会议。', color: '#5A4A3A' },
  { text: '你从凌霄弟子身上搜出纹银三十两。', color: '#7A6A14' },
];

const INITIAL_CHAT: ChatMessage[] = [
  { text: '【闲聊】逍遥剑客：有人组队下副本吗？', color: '#6B5A8B' },
  { text: '【闲聊】冰心仙子：我来！等等我~', color: '#6B5A8B' },
  { text: '【门派】掌门人：今晚八点举行门派大会', color: '#5A4A3A' },
  { text: '【世界】醉仙翁：收购天山雪莲，高价！', color: '#8B6B14' },
];

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

const INITIAL_NPCS: NpcData[] = [
  {
    name: '凌霄弟子',
    nameColor: '#2F5D3A',
    gender: '♂',
    genderColor: '#4A7A5A',
    level: '四十六级',
    hpPct: 70,
    hpColor: '#5A8A6A',
    borderColor: '#2F5D3A40',
  },
  {
    name: '冰心仙子',
    nameColor: '#2F5D3A',
    gender: '♀',
    genderColor: '#8A5A7A',
    level: '五十二级',
    hpPct: 100,
    hpColor: '#5A8A6A',
    borderColor: '#2F5D3A40',
  },
  {
    name: '逍遥剑客',
    nameColor: '#3A5A6B',
    gender: '♂',
    genderColor: '#5A7A8B',
    level: '三十八级',
    hpPct: 60,
    hpColor: '#6A8A9A',
    borderColor: '#2F4F4F40',
  },
  {
    name: '云游僧',
    nameColor: '#3A5A6B',
    gender: '♂',
    genderColor: '#5A7A8B',
    level: '四十五级',
    hpPct: 50,
    hpColor: '#6A8A9A',
    borderColor: '#2F4F4F40',
  },
  {
    name: '醉仙翁',
    nameColor: '#3A5A6B',
    gender: '♂',
    genderColor: '#5A7A8B',
    level: '九十九级',
    hpPct: 100,
    hpColor: '#6A8A9A',
    borderColor: '#2F4F4F40',
  },
];

/* ─── exits → directions 转换 ─── */

/** 方向布局：3x3 网格，英文 key → 中文显示 */
const DIR_GRID: [string, string][][] = [
  [['northwest', '西北'], ['north', '北'], ['northeast', '东北']],
  [['west', '西'], ['center', '中'], ['east', '东']],
  [['southwest', '西南'], ['south', '南'], ['southeast', '东南']],
];

/** 根据可走方向列表生成 Direction[][] */
export function exitsToDirections(exits: string[]): Direction[][] {
  const exitSet = new Set(exits);
  return DIR_GRID.map(row =>
    row.map(([key, text]) => {
      if (key === 'center') {
        return { text, bold: true, center: true };
      }
      return { text, bold: exitSet.has(key) };
    }),
  );
}

/* ─── Store ─── */

export const useGameStore = create<GameState>(set => ({
  // 玩家
  player: { name: '剑心侠客', level: '五十八级', stats: INITIAL_STATS },
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
  appendLog: entry => set(state => ({ gameLog: [...state.gameLog, entry] })),
  clearLog: () => set({ gameLog: [] }),

  // 聊天
  chatMessages: INITIAL_CHAT,
  appendChat: msg =>
    set(state => ({ chatMessages: [...state.chatMessages, msg] })),

  // 方向
  directions: INITIAL_DIRECTIONS,
  setDirections: dirs => set({ directions: dirs }),

  // NPC
  nearbyNpcs: INITIAL_NPCS,
  setNpcs: npcs => set({ nearbyNpcs: npcs }),

  // 指令
  sendCommand: (input: string) => {
    const msg = { type: 'command', data: { input }, timestamp: Date.now() };
    wsService.send(msg);
  },

  // 导航
  activeTab: '江湖',
  setActiveTab: tab => set({ activeTab: tab }),
}));
