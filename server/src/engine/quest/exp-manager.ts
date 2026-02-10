/**
 * ExpManager -- 经验管理器
 *
 * 全局单例，负责经验获取、升级检查、等级称号、属性加点和战斗经验衰减。
 * 注册到 ServiceLocator，与 CombatManager/ObjectManager 同级。
 *
 * 升级公式: level = floor(cbrt(exp * K)) + 1
 * 反向公式: expForLevel = ceil((level-1)^3 / K)
 */
import { Injectable, Logger } from '@nestjs/common';
import { MessageFactory } from '@packages/core';
import type { PlayerBase } from '../game-objects/player-base';
import type { Character } from '../../character/character.entity';
import { sendPlayerStats } from '../../websocket/handlers/stats.utils';

// ========== 常量 ==========

/** 升级公式系数（可调参） */
const K = 0.01;

/** 每级获得的可分配属性点 */
const POINTS_PER_LEVEL = 3;

/** 每级 max_hp 增长量 */
const HP_PER_LEVEL = 50;

/** 每级 max_mp 增长量 */
const MP_PER_LEVEL = 30;

/** 六维属性名称列表 */
const ATTR_KEYS = [
  'wisdom',
  'perception',
  'spirit',
  'meridian',
  'strength',
  'vitality',
] as const;

/** 六维属性对应的上限字段名（Character 实体中的字段） */
const ATTR_CAP_MAP: Record<string, string> = {
  wisdom: 'wisdomCap',
  perception: 'perceptionCap',
  spirit: 'spiritCap',
  meridian: 'meridianCap',
  strength: 'strengthCap',
  vitality: 'vitalityCap',
};

/** 等级称号表 */
const LEVEL_TITLES: { min: number; max: number; title: string }[] = [
  { min: 1, max: 4, title: '初入江湖' },
  { min: 5, max: 9, title: '小有名气' },
  { min: 10, max: 14, title: '江湖新秀' },
  { min: 15, max: 19, title: '侠名远播' },
  { min: 20, max: Infinity, title: '一代宗师' },
];

/** 属性分配请求接口 */
export interface AllocatePointsData {
  allocations: {
    wisdom?: number;
    perception?: number;
    spirit?: number;
    meridian?: number;
    strength?: number;
    vitality?: number;
  };
}

@Injectable()
export class ExpManager {
  private readonly logger = new Logger(ExpManager.name);

  // ================================================================
  //  升级公式
  // ================================================================

  /**
   * 根据等级计算所需经验值
   * 公式: expForLevel = ceil((level-1)^3 / K)
   * level 1 需要 0 经验
   */
  getExpForLevel(level: number): number {
    if (level <= 1) return 0;
    return Math.ceil(Math.pow(level - 1, 3) / K);
  }

  /**
   * 根据经验值计算等级
   * 公式: level = floor(cbrt(exp * K)) + 1
   */
  getLevelForExp(exp: number): number {
    if (exp <= 0) return 1;
    return Math.floor(Math.cbrt(exp * K)) + 1;
  }

  // ================================================================
  //  经验获取
  // ================================================================

  /**
   * 增加经验值（自动检查升级，支持跨级）
   * @param player 玩家对象
   * @param character Character 实体（用于推送属性和检查上限）
   * @param amount 获得的经验值（正数）
   * @returns 是否发生了升级
   */
  gainExp(player: PlayerBase, character: Character, amount: number): boolean {
    if (amount <= 0) return false;

    const oldExp = player.get<number>('exp') ?? 0;
    const newExp = oldExp + amount;
    player.set('exp', newExp);

    // 同步到 Character 实体
    character.exp = newExp;

    // 检查升级
    const didLevelUp = this.checkLevelUp(player, character);

    // 通知玩家获得经验
    const msg = `你获得了 ${amount} 点经验。`;
    player.receiveMessage(msg);

    // 推送属性更新
    sendPlayerStats(player, character);

    return didLevelUp;
  }

  /**
   * 增加潜能点
   * @param player 玩家对象
   * @param character Character 实体
   * @param amount 获得的潜能值
   */
  gainPotential(player: PlayerBase, character: Character, amount: number): void {
    if (amount <= 0) return;

    const current = player.get<number>('potential') ?? 0;
    const newVal = current + amount;
    player.set('potential', newVal);
    character.potential = newVal;

    player.receiveMessage(`你获得了 ${amount} 点潜能。`);
  }

  /**
   * 增加积分
   * @param player 玩家对象
   * @param character Character 实体
   * @param amount 获得的积分
   */
  gainScore(player: PlayerBase, character: Character, amount: number): void {
    if (amount <= 0) return;

    const current = player.get<number>('score') ?? 0;
    const newVal = current + amount;
    player.set('score', newVal);
    character.score = newVal;
  }

  // ================================================================
  //  升级检查
  // ================================================================

  /**
   * 检查并处理升级（支持跨级）
   * 每级奖励: +3 free_points, +50 max_hp, +30 max_mp
   * @returns 是否发生了升级
   */
  checkLevelUp(player: PlayerBase, character: Character): boolean {
    const exp = player.get<number>('exp') ?? 0;
    const currentLevel = player.get<number>('level') ?? 1;
    const targetLevel = this.getLevelForExp(exp);

    if (targetLevel <= currentLevel) return false;

    // 计算跨级数
    const levelsGained = targetLevel - currentLevel;

    // 更新等级
    player.set('level', targetLevel);
    character.level = targetLevel;

    // 累加升级奖励
    const pointsGained = levelsGained * POINTS_PER_LEVEL;
    const hpGained = levelsGained * HP_PER_LEVEL;
    const mpGained = levelsGained * MP_PER_LEVEL;

    // free_points
    const currentPoints = player.get<number>('free_points') ?? 0;
    const newPoints = currentPoints + pointsGained;
    player.set('free_points', newPoints);
    character.freePoints = newPoints;

    // max_hp 增长（更新 character vitality 换算基础不变，通过额外字段记录）
    const currentMaxHp = player.get<number>('max_hp') ?? character.vitality * 100;
    const newMaxHp = currentMaxHp + hpGained;
    player.set('max_hp', newMaxHp);

    // 升级时回满 HP
    player.set('hp', newMaxHp);

    // max_mp 增长
    const currentMaxMp = player.get<number>('max_mp') ?? character.spirit * 80;
    const newMaxMp = currentMaxMp + mpGained;
    player.set('max_mp', newMaxMp);

    // 升级时回满 MP
    player.set('mp', newMaxMp);

    // 升级通知
    const title = this.getLevelTitle(targetLevel);
    if (levelsGained === 1) {
      player.receiveMessage(
        `[important]恭喜！你升到了 ${targetLevel} 级！[/important]（${title}）\n` +
          `获得 ${pointsGained} 个属性点，生命上限 +${hpGained}，内力上限 +${mpGained}。`,
      );
    } else {
      player.receiveMessage(
        `[important]恭喜！你连升 ${levelsGained} 级，达到 ${targetLevel} 级！[/important]（${title}）\n` +
          `获得 ${pointsGained} 个属性点，生命上限 +${hpGained}，内力上限 +${mpGained}。`,
      );
    }

    this.logger.log(
      `玩家 ${player.getName()} 升级: ${currentLevel} -> ${targetLevel}（exp=${exp}）`,
    );

    return true;
  }

  // ================================================================
  //  属性加点
  // ================================================================

  /**
   * 分配属性点
   * 校验: 1) 总点数不超过可用 free_points 2) 每项属性不超过上限
   * @returns { success: boolean; message: string }
   */
  allocatePoints(
    player: PlayerBase,
    character: Character,
    data: AllocatePointsData,
  ): { success: boolean; message: string } {
    const { allocations } = data;

    // 计算总分配点数
    let totalPoints = 0;
    for (const key of ATTR_KEYS) {
      const val = allocations[key];
      if (val != null) {
        if (!Number.isInteger(val) || val < 0) {
          return { success: false, message: '属性点分配值必须为非负整数。' };
        }
        totalPoints += val;
      }
    }

    if (totalPoints === 0) {
      return { success: false, message: '请至少分配一个属性点。' };
    }

    // 检查可用点数
    const freePoints = player.get<number>('free_points') ?? 0;
    if (totalPoints > freePoints) {
      return {
        success: false,
        message: `属性点不足。可用: ${freePoints}，需要: ${totalPoints}。`,
      };
    }

    // 检查各属性是否超过上限
    for (const key of ATTR_KEYS) {
      const val = allocations[key];
      if (val == null || val === 0) continue;

      const currentVal = (character as any)[key] as number;
      const capField = ATTR_CAP_MAP[key];
      const cap = (character as any)[capField] as number;

      if (currentVal + val > cap) {
        const attrNames: Record<string, string> = {
          wisdom: '慧根',
          perception: '心眼',
          spirit: '气海',
          meridian: '脉络',
          strength: '筋骨',
          vitality: '血气',
        };
        return {
          success: false,
          message: `${attrNames[key]}超过上限。当前: ${currentVal}，上限: ${cap}，尝试增加: ${val}。`,
        };
      }
    }

    // 执行分配
    for (const key of ATTR_KEYS) {
      const val = allocations[key];
      if (val == null || val === 0) continue;

      const currentVal = (character as any)[key] as number;
      const newVal = currentVal + val;

      // 更新 Character 实体
      (character as any)[key] = newVal;
      // 同步到 PlayerBase dbase
      player.set(key, newVal);
    }

    // 扣除 free_points
    const remainingPoints = freePoints - totalPoints;
    player.set('free_points', remainingPoints);
    character.freePoints = remainingPoints;

    // 推送属性更新
    sendPlayerStats(player, character);

    this.logger.log(
      `玩家 ${player.getName()} 分配属性点: ${JSON.stringify(allocations)}，剩余: ${remainingPoints}`,
    );

    return { success: true, message: '属性分配成功。' };
  }

  // ================================================================
  //  战斗经验衰减
  // ================================================================

  /**
   * 计算战斗经验（根据等级差衰减）
   * 同级或高 1-3 级: 全额
   * 高 4-5 级: 50%
   * 高 6-10 级: 20%
   * 高 10+ 级: 无经验
   */
  calculateCombatExp(playerLevel: number, npcLevel: number, baseExp: number): number {
    if (baseExp <= 0) return 0;

    const diff = playerLevel - npcLevel;
    if (diff <= 3) return baseExp;
    if (diff <= 5) return Math.floor(baseExp * 0.5);
    if (diff <= 10) return Math.floor(baseExp * 0.2);
    return 0;
  }

  // ================================================================
  //  等级称号
  // ================================================================

  /**
   * 根据等级返回中文称号
   */
  getLevelTitle(level: number): string {
    for (const { min, max, title } of LEVEL_TITLES) {
      if (level >= min && level <= max) return title;
    }
    return '一代宗师';
  }
}
