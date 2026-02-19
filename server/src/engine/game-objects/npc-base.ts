/**
 * NpcBase - NPC 基类
 *
 * 所有 NPC 对象的基类，继承 LivingBase。
 * 名字/描述能力由 LivingBase 提供，本类聚焦心跳 AI、对话等 NPC 专属能力。
 *
 * 闲聊系统：每次心跳检查 chat_chance 概率，命中则从 chat_msg 随机选一条广播。
 *
 * 性格标签：personality（性格倾向）和 speech_style（说话风格）存储在 dbase 中，
 * 影响 NPC 对玩家的称呼和语气。
 */
import { BaseEntity } from '../base-entity';
import { ServiceLocator } from '../service-locator';
import { ItemBase } from './item-base';
import { LivingBase } from './living-base';
import type { PlayerBase } from './player-base';
import { RemainsBase } from './remains-base';
import { RoomBase } from './room-base';
import {
  notifyRoomObjectAdded,
  notifyRoomObjectRemoved,
  getDirectionCN,
  getOppositeDirectionCN,
} from '../../websocket/handlers/room-utils';

/** NPC 性格倾向 */
export type NpcPersonality = 'stern' | 'friendly' | 'cunning' | 'grumpy' | 'timid';

/** NPC 说话风格 */
export type NpcSpeechStyle = 'formal' | 'crude' | 'merchant' | 'scholarly';

/**
 * 称呼映射表: [speech_style][gender] → [普通称呼, 敬称（高等级）]
 * 用于 getPlayerTitle 根据 NPC 风格和玩家性别生成合适的中文称呼
 */
const TITLE_MAP: Record<string, Record<string, [string, string]>> = {
  formal: {
    male: ['少侠', '兄台'],
    female: ['姑娘', '女侠'],
  },
  crude: {
    male: ['小子', '兄弟'],
    female: ['丫头', '妹子'],
  },
  merchant: {
    male: ['客官', '爷'],
    female: ['姑娘', '小姐'],
  },
  scholarly: {
    male: ['公子', '先生'],
    female: ['姑娘', '小姐'],
  },
};

/** 同门称呼: [gender] → [对低级/同级, 对高级] */
const SECT_TITLE_MAP: Record<string, [string, string]> = {
  male: ['师弟', '师兄'],
  female: ['师妹', '师姐'],
};

/** 高等级判定阈值（玩家等级 >= 此值视为高等级） */
const HIGH_LEVEL_THRESHOLD = 15;

/** NPC 漫游配置 */
export interface WanderConfig {
  /** 每次心跳漫游概率（百分比，如 5 = 5%） */
  chance: number;
  /** 允许漫游的房间 ID 白名单 */
  rooms: string[];
}

/** 默认离开文案池（{name} = NPC 名字, {dir} = 方向中文） */
const DEFAULT_WANDER_LEAVE = [
  '[emote][npc]{name}[/npc]向{dir}走去。[/emote]',
  '[emote][npc]{name}[/npc]的身影渐渐消失在{dir}。[/emote]',
  '[emote][npc]{name}[/npc]缓步向{dir}走去。[/emote]',
];

/** 默认到达文案池 */
const DEFAULT_WANDER_ARRIVE = [
  '[emote][npc]{name}[/npc]从{dir}走来。[/emote]',
  '[emote][npc]{name}[/npc]从{dir}缓步走来。[/emote]',
  '[emote][npc]{name}[/npc]的身影从{dir}出现。[/emote]',
];

/** 不直连时的通用离开文案 */
const GENERIC_WANDER_LEAVE = [
  '[emote][npc]{name}[/npc]转身离开了。[/emote]',
];

/** 不直连时的通用到达文案 */
const GENERIC_WANDER_ARRIVE = [
  '[emote][npc]{name}[/npc]来到此处。[/emote]',
];

export class NpcBase extends LivingBase {
  /** NPC 可克隆（非虚拟对象） */
  static virtual = false;

  /** 心跳回调，默认触发 onAI */
  public onHeartbeat(): void {
    this.onAI();
  }

  /**
   * AI 行为钩子
   * 默认实现：检查战斗状态，非战斗时执行漫游和闲聊
   * 漫游和闲聊互斥：漫游成功则跳过本次闲聊
   * 蓝图可覆写扩展更多行为
   */
  protected onAI(): void {
    // 死亡状态不执行 AI
    if (this.getCombatState() === 'dead') return;

    // 战斗中执行战斗 AI（暂未实现）
    if (this.isInCombat()) {
      this.doCombatAI();
      return;
    }

    // 漫游成功则跳过闲聊（刚到新房间不该立刻说话）
    if (this.doWander()) return;

    this.doChat();
  }

  /**
   * 战斗 AI 钩子（蓝图覆写实现具体战斗行为）
   * 默认实现为空，后续由战斗系统补充
   */
  protected doCombatAI(): void {
    // TODO: 战斗系统实现后补充默认战斗 AI
  }

  /** 闲聊：按 chat_chance 概率从 chat_msg 中随机广播一条 */
  protected doChat(): void {
    const chatChance = this.get<number>('chat_chance') || 0;
    if (chatChance <= 0) return;

    // 百分比概率判定
    if (Math.random() * 100 >= chatChance) return;

    const chatMsgs = this.get<string[]>('chat_msg');
    if (!chatMsgs || chatMsgs.length === 0) return;

    const msg = chatMsgs[Math.floor(Math.random() * chatMsgs.length)];
    const env = this.getEnvironment();
    if (env && env instanceof RoomBase) {
      env.broadcast(`[npc]${this.getName()}[/npc]${msg}`);
    }
  }

  /**
   * 漫游：按概率从白名单房间中随机选目标移动
   * @returns true 表示漫游成功（调用方应跳过后续行为）
   */
  protected doWander(): boolean {
    const wander = this.get<WanderConfig>('wander');
    if (!wander || wander.chance <= 0 || !wander.rooms || wander.rooms.length === 0) return false;

    // 概率判定
    if (Math.random() * 100 >= wander.chance) return false;

    const oldRoom = this.getEnvironment();
    if (!oldRoom || !(oldRoom instanceof RoomBase)) return false;

    // 从白名单中排除当前房间，随机选目标
    const candidates = wander.rooms.filter((r) => r !== oldRoom.id);
    if (candidates.length === 0) return false;

    const targetId = candidates[Math.floor(Math.random() * candidates.length)];
    const targetRoom = ServiceLocator.objectManager.findById(targetId);
    if (!targetRoom || !(targetRoom instanceof RoomBase)) return false;

    // 查找方向：遍历当前房间出口，判断目标是否直连
    let leaveDir: string | null = null;
    const exits = oldRoom.get<Record<string, string>>('exits') || {};
    for (const [dir, roomId] of Object.entries(exits)) {
      if (roomId === targetId) {
        leaveDir = dir;
        break;
      }
    }

    // 构建广播文案
    const name = this.getName();
    let leaveMsg: string;
    let arriveMsg: string;

    if (leaveDir) {
      // 直连：使用带方向的文案
      const leaveMsgs = this.get<string[]>('wander_leave_msg') ?? DEFAULT_WANDER_LEAVE;
      const arriveMsgs = this.get<string[]>('wander_arrive_msg') ?? DEFAULT_WANDER_ARRIVE;
      leaveMsg = leaveMsgs[Math.floor(Math.random() * leaveMsgs.length)]
        .replace(/\{name\}/g, name)
        .replace(/\{dir\}/g, getDirectionCN(leaveDir));
      arriveMsg = arriveMsgs[Math.floor(Math.random() * arriveMsgs.length)]
        .replace(/\{name\}/g, name)
        .replace(/\{dir\}/g, getOppositeDirectionCN(leaveDir));
    } else {
      // 不直连：使用通用文案
      leaveMsg = GENERIC_WANDER_LEAVE[Math.floor(Math.random() * GENERIC_WANDER_LEAVE.length)]
        .replace(/\{name\}/g, name);
      arriveMsg = GENERIC_WANDER_ARRIVE[Math.floor(Math.random() * GENERIC_WANDER_ARRIVE.length)]
        .replace(/\{name\}/g, name);
    }

    // 静默移动（不触发事件链）
    this.moveTo(targetRoom, { quiet: true });

    // 旧房间：广播离去 + 增量通知前端
    oldRoom.broadcast(leaveMsg);
    notifyRoomObjectRemoved(oldRoom, this.id, 'npc');

    // 新房间：广播到达 + 增量通知前端
    targetRoom.broadcast(arriveMsg);
    notifyRoomObjectAdded(targetRoom, this);

    return true;
  }

  /** NPC 失去环境（不在任何房间）→ 可清理 */
  public onCleanUp(): boolean {
    if (!this.getEnvironment()) return true;
    return false;
  }

  /**
   * NPC 死亡: 创建残骸容器，转移装备和物品到残骸，然后销毁自身
   */
  die(): void {
    super.die();
    const env = this.getEnvironment();
    const spawnBlueprintId = this.getTemp<string>('spawn/blueprintId');
    const spawnRoomId = this.getTemp<string>('spawn/roomId') ?? (env ? env.id : undefined);
    const spawnInterval = this.getTemp<number>('spawn/interval');

    // 创建残骸
    const remainsId = ServiceLocator.objectManager.nextInstanceId('remains');
    const remains = new RemainsBase(remainsId, this.getName());
    ServiceLocator.objectManager.register(remains);
    remains.enableHeartbeat(1000);

    // 转移装备到残骸
    for (const [pos, item] of this.getEquipment()) {
      if (item) {
        this.unequip(pos);
        item.moveTo(remains, { quiet: true });
      }
    }

    // 转移背包物品到残骸
    for (const child of [...this.getInventory()]) {
      if (child instanceof ItemBase) {
        child.moveTo(remains, { quiet: true });
      }
    }

    // 残骸放入房间，并增量通知在场玩家
    if (env && env instanceof RoomBase) {
      remains.moveTo(env, { quiet: true });
      env.broadcast(`[npc]${this.getName()}[/npc]倒在了地上，留下了一具残骸。`);
      notifyRoomObjectAdded(env, remains);
    }

    // 通过 SpawnManager 刷新的 NPC 死亡后自动重生，避免任务怪被长期打空
    if (
      spawnBlueprintId &&
      spawnRoomId &&
      ServiceLocator.initialized &&
      ServiceLocator.spawnManager
    ) {
      const delayMs =
        typeof spawnInterval === 'number' && spawnInterval > 0 ? Math.floor(spawnInterval) : 60000;
      ServiceLocator.spawnManager.scheduleRespawn(spawnBlueprintId, spawnRoomId, delayMs);
    }

    // 在销毁前捕获 ID，销毁后增量通知在场玩家 NPC 消失
    const npcId = this.id;
    this.destroy();
    if (env && env instanceof RoomBase) {
      notifyRoomObjectRemoved(env, npcId, 'npc');
    }
  }

  /** 对话接口（蓝图覆写） */
  onChat(speaker: BaseEntity, message: string): void {}

  /**
   * 接收物品钩子（蓝图覆写）
   * 默认实现拒绝所有物品，蓝图可覆写实现特定 NPC 接受特定物品。
   * @returns accept: true 时物品移至 NPC，false 时留在玩家背包
   */
  onReceiveItem(_giver: LivingBase, _item: ItemBase): { accept: boolean; message?: string } {
    return {
      accept: false,
      message: `${this.getName()}不需要这个东西。`,
    };
  }

  // ========== 性格标签与称呼系统 ==========

  /**
   * 根据 NPC 性格/风格和玩家属性生成合适的中文称呼
   *
   * 优先级：同门称呼 > 风格称呼
   * - 同门 NPC 见本门弟子：根据等级高低称"师弟/师妹"或"师兄/师姐"
   * - 非同门：根据 speech_style + gender + level 选择称呼
   *
   * @param player 玩家对象
   * @returns 中文称呼字符串
   */
  getPlayerTitle(player: PlayerBase): string {
    const playerGender = player.get<string>('gender') || 'male';
    const playerLevel = player.get<number>('level') || 1;

    // 同门优先：NPC 和玩家同门派时用师兄弟称呼
    if (this.isPlayerSameSect(player)) {
      const npcLevel = this.get<number>('level') || 1;
      const titles = SECT_TITLE_MAP[playerGender] || SECT_TITLE_MAP['male'];
      // 玩家等级 >= NPC 等级 → 称师兄/师姐，否则称师弟/师妹
      return playerLevel >= npcLevel ? titles[1] : titles[0];
    }

    // 根据说话风格和性别选择称呼
    const speechStyle = this.get<string>('speech_style') || 'formal';
    const styleTitles = TITLE_MAP[speechStyle] || TITLE_MAP['formal'];
    const genderTitles = styleTitles[playerGender] || styleTitles['male'];

    // 高等级玩家用敬称（索引 1），否则用普通称呼（索引 0）
    return playerLevel >= HIGH_LEVEL_THRESHOLD ? genderTitles[1] : genderTitles[0];
  }

  /**
   * 玩家进入房间钩子（蓝图覆写）
   * 当玩家移动到 NPC 所在的房间时触发。
   * 默认空实现，各 NPC 蓝图可覆写实现：
   * - 守卫型 NPC：审视、盘问
   * - 商人型 NPC：招揽生意
   * - 闲散型 NPC：偶尔搭话
   *
   * @param player 进入房间的玩家
   */
  onPlayerEnter(_player: PlayerBase): void {}

  // ========== 工具方法 ==========

  /**
   * 判断玩家是否低血量（HP < 30%）
   * 用于 NPC 关心玩家状态的对话分支
   */
  isPlayerLowHp(player: PlayerBase): boolean {
    const hp = player.get<number>('hp') ?? 0;
    const maxHp = player.getMaxHp();
    if (maxHp <= 0) return false;
    return hp / maxHp < 0.3;
  }

  /**
   * 判断玩家是否与 NPC 同门派
   * 比较 NPC 的 sect_id 与玩家的 sect.current.sectId
   */
  isPlayerSameSect(player: PlayerBase): boolean {
    const npcSectId = this.get<string>('sect_id');
    if (!npcSectId) return false;

    // 玩家门派数据结构: dbase.sect.current.sectId
    const playerSectData = player.get<{ current?: { sectId?: string } }>('sect');
    const playerSectId = playerSectData?.current?.sectId;
    if (!playerSectId) return false;

    return npcSectId === playerSectId;
  }
}
