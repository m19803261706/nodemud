/**
 * 通用门派任务模板池
 * 所有门派共享的日常/周常任务模板。
 * 门派特色模板由各门派的 SectPolicy.getCustomDailyPool()/getCustomWeeklyPool() 提供。
 */
import type { SectTaskTemplate, SectTaskInstance, TaskGenContext } from './types';
import { ServiceLocator } from '../service-locator';
import { RoomBase } from '../game-objects/room-base';

// ========== 辅助函数 ==========

/** 从数组中随机挑选一个 */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 随机整数 [min, max] */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 通过房间 ID 获取中文房间名 */
function getRoomName(roomId: string): string {
  const room = ServiceLocator.objectManager?.findById(roomId);
  if (room instanceof RoomBase) return room.getShort();
  // 降级：取路径最后一段
  return roomId.split('/').pop() ?? roomId;
}

// ========== 通用日常模板 ==========

/** 巡山 — gotoSequence */
const patrol: SectTaskTemplate = {
  templateId: 'common-daily-patrol',
  category: 'daily',
  name: '巡山',
  objectiveType: 'gotoSequence',
  alignmentFilter: null,
  toneFilter: null,
  weight: 10,
  paramGen: (ctx: TaskGenContext): SectTaskInstance => {
    const rooms =
      ctx.areaRoomIds.length >= 3
        ? ctx.areaRoomIds.sort(() => Math.random() - 0.5).slice(0, 3)
        : ['area/songyang/gate', 'area/songyang/drill-ground', 'area/songyang/mountain-path'];
    return {
      templateId: 'common-daily-patrol',
      category: 'daily',
      name: '巡山',
      description: `按照执事安排，依次巡视${rooms.length}个地点，确认无异常。`,
      objectives: rooms.map((roomId) => ({
        type: 'goto' as const,
        targetId: roomId,
        count: 1,
        description: `前往${getRoomName(roomId)}`,
        current: 0,
      })),
      timeLimit: 30 * 60 * 1000,
      rewards: { contribution: 8, exp: 30, potential: 5 },
      flavorText: {
        onAssign: '执事递过一张巡山令牌，道："沿途留心，莫懈怠。"',
        onComplete: '你将令牌交回，执事点头道："辛苦了。"',
      },
    };
  },
};

/** 送信 — deliver */
const deliver: SectTaskTemplate = {
  templateId: 'common-daily-deliver',
  category: 'daily',
  name: '传递文书',
  objectiveType: 'deliver',
  alignmentFilter: null,
  toneFilter: null,
  weight: 10,
  paramGen: (ctx: TaskGenContext): SectTaskInstance => {
    const destinations = [
      { room: 'area/songyang/hall', name: '议事堂' },
      { room: 'area/songyang/meditation-room', name: '静思堂' },
      { room: 'area/songyang/drill-ground', name: '演武场' },
      { room: 'area/songyang/scripture-pavilion', name: '藏卷阁' },
    ];
    const dest = pick(destinations);
    return {
      templateId: 'common-daily-deliver',
      category: 'daily',
      name: '传递文书',
      description: `将执事的文书送到${dest.name}。`,
      objectives: [
        {
          type: 'goto' as const,
          targetId: dest.room,
          count: 1,
          description: `前往${dest.name}`,
          current: 0,
        },
      ],
      timeLimit: 30 * 60 * 1000,
      rewards: { contribution: 6, exp: 20, potential: 3 },
      flavorText: {
        onAssign: '执事从案上拿起一封火漆封好的文书，叮嘱道："速去速回。"',
        onComplete: '文书送达，你抱拳复命。',
      },
    };
  },
};

/** 采集 — collect */
const collect: SectTaskTemplate = {
  templateId: 'common-daily-collect',
  category: 'daily',
  name: '采集药草',
  objectiveType: 'collect',
  alignmentFilter: null,
  toneFilter: null,
  weight: 8,
  paramGen: (ctx: TaskGenContext): SectTaskInstance => {
    const herbs = ['金线草', '断肠藤', '七星莲', '石斛'];
    const herb = pick(herbs);
    const count = randInt(2, 4);
    return {
      templateId: 'common-daily-collect',
      category: 'daily',
      name: '采集药草',
      description: `药圃需要${count}株${herb}，去山间寻找吧。`,
      objectives: [
        {
          type: 'collect' as const,
          targetId: `herb-${herb}`,
          count,
          description: `采集${herb} ${count}株`,
          current: 0,
        },
      ],
      timeLimit: 30 * 60 * 1000,
      rewards: { contribution: 10, exp: 25, potential: 5 },
      flavorText: {
        onAssign: '"药圃里的草药快用完了，去山里采些回来。"',
        onComplete: '药童接过草药，仔细端详后点了点头。',
      },
    };
  },
};

/** 陪练 — timed */
const drillAssist: SectTaskTemplate = {
  templateId: 'common-daily-drill',
  category: 'daily',
  name: '协助演武',
  objectiveType: 'timed',
  alignmentFilter: null,
  toneFilter: null,
  weight: 8,
  paramGen: (ctx: TaskGenContext): SectTaskInstance => {
    return {
      templateId: 'common-daily-drill',
      category: 'daily',
      name: '协助演武',
      description: '前往演武场协助新弟子练功。',
      objectives: [
        {
          type: 'goto' as const,
          targetId: 'area/songyang/drill-ground',
          count: 1,
          description: '前往演武场',
          current: 0,
        },
      ],
      timeLimit: 30 * 60 * 1000,
      rewards: { contribution: 8, exp: 35, potential: 8 },
      flavorText: {
        onAssign: '"演武场缺人手，去帮帮新弟子们。"',
        onComplete: '新弟子们纷纷抱拳致谢。',
      },
    };
  },
};

/** 抄经 — timed */
const copyScripture: SectTaskTemplate = {
  templateId: 'common-daily-copy',
  category: 'daily',
  name: '抄录经文',
  objectiveType: 'timed',
  alignmentFilter: null,
  toneFilter: ['orthodox', 'scholarly', 'reclusive'],
  weight: 6,
  paramGen: (ctx: TaskGenContext): SectTaskInstance => {
    return {
      templateId: 'common-daily-copy',
      category: 'daily',
      name: '抄录经文',
      description: '在藏卷阁抄录一卷经文，静心养气。',
      objectives: [
        {
          type: 'goto' as const,
          targetId: 'area/songyang/scripture-pavilion',
          count: 1,
          description: '前往藏卷阁',
          current: 0,
        },
      ],
      timeLimit: 30 * 60 * 1000,
      rewards: { contribution: 6, exp: 20, potential: 10 },
      flavorText: {
        onAssign: '"藏卷阁有一卷经文待抄，去吧，也算修心。"',
        onComplete: '你放下笔，墨迹尚湿。经文已一字不差地抄录完毕。',
      },
    };
  },
};

// ========== 通用周常模板 ==========

/** 讨伐 — kill (正道/中立) */
const subjugate: SectTaskTemplate = {
  templateId: 'common-weekly-subjugate',
  category: 'weekly',
  name: '清剿匪患',
  objectiveType: 'kill',
  alignmentFilter: ['righteous', 'neutral'],
  toneFilter: null,
  weight: 10,
  paramGen: (ctx: TaskGenContext): SectTaskInstance => {
    const count = randInt(3, 5);
    return {
      templateId: 'common-weekly-subjugate',
      category: 'weekly',
      name: '清剿匪患',
      description: `山匪猖獗，击败${count}名山匪以正门风。`,
      objectives: [
        {
          type: 'kill' as const,
          targetId: 'npc/songyang/mountain-bandit',
          count,
          description: `击败山匪 ${count}名`,
          current: 0,
        },
      ],
      timeLimit: 7 * 24 * 60 * 60 * 1000,
      rewards: { contribution: 30, exp: 100, potential: 20, silver: 50 },
      flavorText: {
        onAssign: '"乱石坡的匪患不可再拖，去处理吧。"',
        onComplete: '"做得好。正道之士，当行正道之事。"',
      },
    };
  },
};

/** 护送 — gotoSequence (正道/中立) */
const escort: SectTaskTemplate = {
  templateId: 'common-weekly-escort',
  category: 'weekly',
  name: '护送行商',
  objectiveType: 'gotoSequence',
  alignmentFilter: ['righteous', 'neutral'],
  toneFilter: null,
  weight: 8,
  paramGen: (ctx: TaskGenContext): SectTaskInstance => {
    const waypoints = [
      'area/songyang/pine-pavilion',
      'area/songyang/mountain-path-lower',
      'area/songyang/road-songshan',
    ];
    return {
      templateId: 'common-weekly-escort',
      category: 'weekly',
      name: '护送行商',
      description: '护送行商安全下山至官道。',
      objectives: waypoints.map((roomId) => ({
        type: 'goto' as const,
        targetId: roomId,
        count: 1,
        description: `护送至${getRoomName(roomId)}`,
        current: 0,
      })),
      timeLimit: 7 * 24 * 60 * 60 * 1000,
      rewards: { contribution: 25, exp: 80, potential: 15, silver: 100 },
      flavorText: {
        onAssign: '一名行商在山门外候着，望着山道面露忧色。',
        onComplete: '行商千恩万谢，掏出一锭碎银作为谢礼。',
      },
    };
  },
};

/** 破坏 — kill (邪派) */
const sabotage: SectTaskTemplate = {
  templateId: 'common-weekly-sabotage',
  category: 'weekly',
  name: '暗中破坏',
  objectiveType: 'kill',
  alignmentFilter: ['evil'],
  toneFilter: null,
  weight: 10,
  paramGen: (ctx: TaskGenContext): SectTaskInstance => {
    const count = randInt(2, 4);
    return {
      templateId: 'common-weekly-sabotage',
      category: 'weekly',
      name: '暗中破坏',
      description: `潜入附近区域，制造混乱以削弱敌方势力。击败${count}名巡逻者。`,
      objectives: [
        {
          type: 'kill' as const,
          targetId: 'npc/songyang/patrol-disciple',
          count,
          description: `击败巡逻者 ${count}名`,
          current: 0,
        },
      ],
      timeLimit: 7 * 24 * 60 * 60 * 1000,
      rewards: { contribution: 35, exp: 120, potential: 25, silver: 80 },
      flavorText: {
        onAssign: '"去吧，让他们知道天裂教的手伸得到任何地方。"',
        onComplete: '"做得干净利落。教主会记住你的功劳。"',
      },
    };
  },
};

/** 刺探 — gotoSequence (邪/中立) */
const infiltrate: SectTaskTemplate = {
  templateId: 'common-weekly-infiltrate',
  category: 'weekly',
  name: '刺探情报',
  objectiveType: 'gotoSequence',
  alignmentFilter: ['evil', 'neutral'],
  toneFilter: null,
  weight: 8,
  paramGen: (ctx: TaskGenContext): SectTaskInstance => {
    const targets = ['area/songyang/road-songshan', 'area/songyang/road-rift'];
    return {
      templateId: 'common-weekly-infiltrate',
      category: 'weekly',
      name: '刺探情报',
      description: '前往官道一带刺探消息。',
      objectives: targets.map((roomId) => ({
        type: 'goto' as const,
        targetId: roomId,
        count: 1,
        description: `前往${getRoomName(roomId)}`,
        current: 0,
      })),
      timeLimit: 7 * 24 * 60 * 60 * 1000,
      rewards: { contribution: 20, exp: 60, potential: 15, silver: 50 },
      flavorText: {
        onAssign: '"去官道上打探打探，看看最近有什么风声。"',
        onComplete: '"消息已记下，你的眼线做得不错。"',
      },
    };
  },
};

// ========== 导出所有通用模板 ==========

export const COMMON_TASK_TEMPLATES: SectTaskTemplate[] = [
  // 日常
  patrol,
  deliver,
  collect,
  drillAssist,
  copyScripture,
  // 周常
  subjugate,
  escort,
  sabotage,
  infiltrate,
];
