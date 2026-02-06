/**
 * CombatManager — 战斗调度器
 *
 * 管理所有活跃战斗的 ATB 读条轮转、攻击触发和战斗生命周期。
 * 注册到 HeartbeatManager（1s 心跳），每 tick 处理所有战斗实例。
 *
 * ATB 核心:
 *   fillRate = speed × SPEED_FACTOR(5)
 *   gauge += fillRate per tick
 *   gauge >= MAX_GAUGE(1000) → 触发攻击 → gauge -= MAX_GAUGE（保留溢出）
 *   while 循环允许同一 tick 多次出手
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  COMBAT_CONSTANTS,
  MessageFactory,
  type CombatAction,
  type CombatEndReason,
  type CombatFighter,
  type CombatStartData,
  type CombatUpdateData,
  type CombatEndData,
} from '@packages/core';
import { BaseEntity } from '../base-entity';
import { HeartbeatManager } from '../heartbeat-manager';
import { ServiceLocator } from '../service-locator';
import type { LivingBase } from '../game-objects/living-base';
import { PlayerBase } from '../game-objects/player-base';
import type { RoomBase } from '../game-objects/room-base';
import { DamageEngine } from './damage-engine';
import { sendRoomInfo } from '../../websocket/handlers/room-utils';
import type { CombatInstance, CombatParticipant } from './types';

/** 战斗 ID 计数器 */
let combatCounter = 0;

@Injectable()
export class CombatManager implements OnModuleInit {
  private readonly logger = new Logger(CombatManager.name);

  /** 所有活跃战斗 Map<combatId, CombatInstance> */
  private readonly combats: Map<string, CombatInstance> = new Map();

  /** entity.id → combatId 快速查找 */
  private readonly entityCombatMap: Map<string, string> = new Map();

  /** 心跳驱动实体（用于注册到 HeartbeatManager） */
  private heartbeatEntity!: BaseEntity;

  constructor(private readonly heartbeatManager: HeartbeatManager) {}

  onModuleInit(): void {
    // 创建一个虚拟实体注册心跳，驱动战斗 tick
    this.heartbeatEntity = new BaseEntity('__combat_manager__');
    (this.heartbeatEntity as any).onHeartbeat = () => this.onHeartbeat();
    this.heartbeatManager.register(this.heartbeatEntity, 1000);
    this.logger.log('CombatManager 心跳已注册（1s tick）');
  }

  // ================================================================
  //  公共 API
  // ================================================================

  /**
   * 发起战斗
   * @param attacker 攻击方（通常为玩家）
   * @param defender 防御方（通常为 NPC）
   * @returns combatId
   */
  startCombat(attacker: LivingBase, defender: LivingBase): string {
    const combatId = `combat_${Date.now()}_${++combatCounter}`;

    // 判断谁是 player 谁是 enemy
    const isAttackerPlayer = attacker instanceof PlayerBase;
    const player = isAttackerPlayer ? attacker : defender;
    const enemy = isAttackerPlayer ? defender : attacker;

    // 创建参与者
    const playerParticipant: CombatParticipant = {
      entity: player,
      side: 'player',
      gauge: 0,
      target: enemy,
    };
    const enemyParticipant: CombatParticipant = {
      entity: enemy,
      side: 'enemy',
      gauge: 0,
      target: player,
    };

    const participants = new Map<string, CombatParticipant>();
    participants.set(player.id, playerParticipant);
    participants.set(enemy.id, enemyParticipant);

    const combat: CombatInstance = {
      id: combatId,
      participants,
      startTime: Date.now(),
      player,
      enemy,
    };

    this.combats.set(combatId, combat);
    this.entityCombatMap.set(player.id, combatId);
    this.entityCombatMap.set(enemy.id, combatId);

    // 设置双方战斗状态
    player.setTemp('combat/state', 'fighting');
    player.setTemp('combat/id', combatId);
    enemy.setTemp('combat/state', 'fighting');
    enemy.setTemp('combat/id', combatId);

    // 推送 combatStart
    const startData: CombatStartData = {
      combatId,
      player: this.buildFighterInfo(player, playerParticipant),
      enemy: this.buildFighterInfo(enemy, enemyParticipant),
    };
    this.sendToPlayer(player, 'combatStart', startData);

    this.logger.log(`战斗开始: ${player.getName()} vs ${enemy.getName()} (${combatId})`);

    return combatId;
  }

  /**
   * 结束战斗
   * @param combatId 战斗 ID
   * @param reason 结束原因
   */
  async endCombat(combatId: string, reason: CombatEndReason): Promise<void> {
    const combat = this.combats.get(combatId);
    if (!combat) return;

    const { player, enemy } = combat;

    // 生成结束消息
    let message: string;
    switch (reason) {
      case 'victory':
        message = `你击败了[npc]${enemy.getName()}[/npc]！`;
        break;
      case 'defeat':
        message = `你被[npc]${enemy.getName()}[/npc]击败了...`;
        break;
      case 'flee':
        message = '你逃离了战斗。';
        break;
    }

    // 推送 combatEnd
    const endData: CombatEndData = { combatId, reason, message };
    this.sendToPlayer(player, 'combatEnd', endData);

    // 清理战斗状态（同步，确保后续 tick 不再处理此战斗）
    this.cleanupCombat(combat);

    // 玩家战败后：复活 + 传送广场 + 推送房间信息
    if (reason === 'defeat' && player instanceof PlayerBase) {
      await player.revive();
      const room = player.getEnvironment() as RoomBase | null;
      if (room) {
        sendRoomInfo(player, room, ServiceLocator.blueprintFactory);
        room.broadcast(`${player.getName()}在此处苏醒了。`, player);
      }
    }

    this.logger.log(`战斗结束: ${player.getName()} vs ${enemy.getName()} (${reason})`);
  }

  /** 查询实体是否在战斗中 */
  isInCombat(entity: LivingBase): boolean {
    return this.entityCombatMap.has(entity.id);
  }

  /** 获取实体所在的战斗 ID */
  getCombatId(entity: LivingBase): string | null {
    return this.entityCombatMap.get(entity.id) ?? null;
  }

  /** 获取战斗实例 */
  getCombat(combatId: string): CombatInstance | undefined {
    return this.combats.get(combatId);
  }

  /**
   * 尝试逃跑
   * 逃跑概率 = 50% + (玩家speed - 对手speed) × 0.5%
   * 范围 [20%, 90%]
   * 成功 → endCombat('flee')
   * 失败 → 浪费本次出手，返回 flee_fail action
   */
  attemptFlee(combatId: string, fleer: LivingBase): boolean {
    const combat = this.combats.get(combatId);
    if (!combat) return false;

    const fleerParticipant = combat.participants.get(fleer.id);
    if (!fleerParticipant) return false;

    const target = fleerParticipant.target;
    const fleerSpeed = fleer.getCombatSpeed();
    const targetSpeed = target.getCombatSpeed();

    // 逃跑概率
    const { FLEE_BASE_CHANCE, FLEE_SPEED_FACTOR, FLEE_MIN_CHANCE, FLEE_MAX_CHANCE } =
      COMBAT_CONSTANTS;
    const raw = FLEE_BASE_CHANCE + (fleerSpeed - targetSpeed) * FLEE_SPEED_FACTOR;
    const chance = Math.max(FLEE_MIN_CHANCE, Math.min(FLEE_MAX_CHANCE, raw));

    if (Math.random() < chance) {
      // 逃跑成功
      this.endCombat(combatId, 'flee');
      return true;
    }

    // 逃跑失败 → 浪费出手，gauge 重置为 0
    fleerParticipant.gauge = 0;

    // 推送 flee_fail action
    const actions: CombatAction[] = [
      {
        attacker: fleerParticipant.side,
        type: 'flee_fail',
        isCrit: false,
        description: `[combat]${fleer.getName()}[/combat]试图逃跑，但失败了！`,
      },
    ];
    this.sendCombatUpdate(combat, actions);

    return false;
  }

  // ================================================================
  //  心跳处理
  // ================================================================

  /** 每秒 tick，处理所有活跃战斗 */
  private onHeartbeat(): void {
    // 使用数组快照遍历，避免迭代中修改 Map
    for (const combat of [...this.combats.values()]) {
      this.processCombat(combat);
    }
  }

  /**
   * 处理单场战斗的 ATB 累积 + 攻击触发
   * 核心 ATB 算法: gauge += speed * SPEED_FACTOR，gauge >= MAX_GAUGE 时出手
   */
  private processCombat(combat: CombatInstance): void {
    const { MAX_GAUGE, SPEED_FACTOR } = COMBAT_CONSTANTS;
    const actions: CombatAction[] = [];

    for (const participant of combat.participants.values()) {
      // 跳过已死亡的参与者
      if (participant.entity.getCombatState() === 'dead') continue;

      const speed = participant.entity.getCombatSpeed();
      const fillRate = speed * SPEED_FACTOR;

      participant.gauge += fillRate;

      // while 循环: 允许同一 tick 多次出手
      while (participant.gauge >= MAX_GAUGE) {
        participant.gauge -= MAX_GAUGE;

        const result = DamageEngine.calculate(participant.entity, participant.target);

        if (result.damage > 0) {
          participant.target.receiveDamage(result.damage);
        }

        actions.push({
          attacker: participant.side,
          type: result.type as CombatAction['type'],
          damage: result.damage,
          isCrit: result.isCrit,
          description: result.description,
        });

        // 检查目标死亡
        const targetHp = participant.target.get<number>('hp') ?? 0;
        if (targetHp <= 0) {
          const reason: CombatEndReason = participant.side === 'player' ? 'victory' : 'defeat';
          // 先发送最后一次 update（含致命一击）
          this.sendCombatUpdate(combat, actions);
          this.endCombat(combat.id, reason);
          return;
        }
      }
    }

    // 每 tick 都推送 update（含 ATB 进度），即使没有攻击动作
    this.sendCombatUpdate(combat, actions);
  }

  // ================================================================
  //  消息推送
  // ================================================================

  /** 推送 combatUpdate 消息 */
  private sendCombatUpdate(combat: CombatInstance, actions: CombatAction[]): void {
    const playerParticipant = combat.participants.get(combat.player.id);
    const enemyParticipant = combat.participants.get(combat.enemy.id);
    if (!playerParticipant || !enemyParticipant) return;

    const updateData: CombatUpdateData = {
      combatId: combat.id,
      actions,
      player: {
        hp: combat.player.get<number>('hp') ?? 0,
        maxHp: combat.player.get<number>('max_hp') ?? 100,
        atbPct: Math.floor((playerParticipant.gauge / COMBAT_CONSTANTS.MAX_GAUGE) * 100),
      },
      enemy: {
        hp: combat.enemy.get<number>('hp') ?? 0,
        maxHp: combat.enemy.get<number>('max_hp') ?? 100,
        atbPct: Math.floor((enemyParticipant.gauge / COMBAT_CONSTANTS.MAX_GAUGE) * 100),
      },
    };

    this.sendToPlayer(combat.player, 'combatUpdate', updateData);
  }

  /** 向玩家推送 WebSocket 消息 */
  private sendToPlayer(player: LivingBase, type: string, data: any): void {
    if (player instanceof PlayerBase) {
      const msg = MessageFactory.create(type, data);
      if (msg) {
        player.sendToClient(MessageFactory.serialize(msg));
      }
    }
  }

  /** 构建 CombatFighter 信息 */
  private buildFighterInfo(entity: LivingBase, participant: CombatParticipant): CombatFighter {
    return {
      name: entity.getName(),
      level: entity.get<number>('level') ?? 1,
      hp: entity.get<number>('hp') ?? 0,
      maxHp: entity.get<number>('max_hp') ?? 100,
      atbPct: Math.floor((participant.gauge / COMBAT_CONSTANTS.MAX_GAUGE) * 100),
    };
  }

  // ================================================================
  //  清理
  // ================================================================

  /** 清理战斗实例和双方状态 */
  private cleanupCombat(combat: CombatInstance): void {
    // 清理参与者的战斗状态
    for (const participant of combat.participants.values()) {
      const entity = participant.entity;
      // 只重置非死亡的实体状态为 idle
      if (entity.getCombatState() !== 'dead') {
        entity.setTemp('combat/state', 'idle');
      }
      entity.delTemp('combat/id');
      this.entityCombatMap.delete(entity.id);
    }

    this.combats.delete(combat.id);
  }
}
