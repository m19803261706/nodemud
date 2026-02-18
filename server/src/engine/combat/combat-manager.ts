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
  CombatParticipantState,
  SKILL_CONSTANTS,
  MessageFactory,
  type CombatAction,
  type CombatEndReason,
  type CombatFighter,
  type CombatStartData,
  type CombatUpdateData,
  type CombatEndData,
  type CombatAwaitActionData,
} from '@packages/core';
import { BaseEntity } from '../base-entity';
import { HeartbeatManager } from '../heartbeat-manager';
import { ServiceLocator } from '../service-locator';
import type { LivingBase } from '../game-objects/living-base';
import { PlayerBase } from '../game-objects/player-base';
import { NpcBase } from '../game-objects/npc-base';
import type { RoomBase } from '../game-objects/room-base';
import { WeaponBase } from '../game-objects/weapon-base';
import { DamageEngine } from './damage-engine';
import { sendRoomInfo } from '../../websocket/handlers/room-utils';
import type { CombatInstance, CombatMode, CombatParticipant } from './types';
import type { SkillManager } from '../skills/skill-manager';
import type { SkillAction } from '../skills/types';
import type { WeaponSkillBase } from '../skills/martial/weapon/weapon-skill-base';

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
   * @param options 战斗选项（普通/演武模式）
   * @returns combatId
   */
  startCombat(attacker: LivingBase, defender: LivingBase, options?: { mode?: CombatMode }): string {
    const combatId = `combat_${Date.now()}_${++combatCounter}`;
    const mode: CombatMode = options?.mode ?? 'normal';

    // 判断谁是 player 谁是 enemy
    const isAttackerPlayer = attacker instanceof PlayerBase;
    const player = isAttackerPlayer ? attacker : defender;
    const enemy = isAttackerPlayer ? defender : attacker;

    // 创建参与者（初始状态为 CHARGING）
    const playerParticipant: CombatParticipant = {
      entity: player,
      side: 'player',
      gauge: 0,
      target: enemy,
      state: CombatParticipantState.CHARGING,
      actionCooldowns: new Map(),
    };
    const enemyParticipant: CombatParticipant = {
      entity: enemy,
      side: 'enemy',
      gauge: 0,
      target: player,
      state: CombatParticipantState.CHARGING,
      actionCooldowns: new Map(),
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
      mode,
    };

    this.combats.set(combatId, combat);
    this.entityCombatMap.set(player.id, combatId);
    this.entityCombatMap.set(enemy.id, combatId);

    // 设置双方战斗状态
    player.setTemp('combat/state', 'fighting');
    player.setTemp('combat/id', combatId);
    enemy.setTemp('combat/state', 'fighting');
    enemy.setTemp('combat/id', combatId);

    // 推送 combatStart（携带初始招式列表）
    const startData: CombatStartData = {
      combatId,
      player: this.buildFighterInfo(player, playerParticipant),
      enemy: this.buildFighterInfo(enemy, enemyParticipant),
    };
    if (player instanceof PlayerBase) {
      const skillMgr = this.getSkillManager(player);
      if (skillMgr) {
        startData.availableActions = this.getActionsWithCooldown(
          player,
          playerParticipant,
          skillMgr,
        );
      }
    }
    this.sendToPlayer(player, 'combatStart', startData);

    this.logger.log(`战斗开始[${mode}]: ${player.getName()} vs ${enemy.getName()} (${combatId})`);

    return combatId;
  }

  /**
   * 发起演武战斗
   * 演武模式下不会触发死亡、掉落和击杀奖励。
   */
  startSparCombat(attacker: LivingBase, defender: LivingBase): string {
    return this.startCombat(attacker, defender, { mode: 'spar' });
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
    if (combat.mode === 'spar') {
      switch (reason) {
        case 'victory':
          message = `你在演武中胜过了[npc]${enemy.getName()}[/npc]。`;
          break;
        case 'defeat':
          message = `你在演武中败给了[npc]${enemy.getName()}[/npc]。`;
          break;
        case 'flee':
          message = '你中止了演武。';
          break;
      }
    } else {
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
    }

    // 推送 combatEnd
    const endData: CombatEndData = { combatId, reason, message };
    this.sendToPlayer(player, 'combatEnd', endData);

    // 清理战斗状态（同步，确保后续 tick 不再处理此战斗）
    this.cleanupCombat(combat);

    // 玩家胜利后：普通战斗发放击杀奖励，演武发放门派贡献
    if (reason === 'victory' && player instanceof PlayerBase && enemy instanceof NpcBase) {
      if (combat.mode === 'spar') {
        // 演武不应残留“濒死”状态，避免被立即补刀触发掉落链路
        enemy.set('hp', enemy.getMaxHp());
        if (ServiceLocator.sectManager) {
          ServiceLocator.sectManager.onSparFinished(player, enemy, true);
        }
      } else {
        this.handleVictoryRewards(player, enemy);
        // NPC 死亡后房间状态已变（NPC 移除 + 残骸生成），刷新客户端房间信息
        const room = player.getEnvironment() as RoomBase | null;
        if (room) {
          sendRoomInfo(player, room, ServiceLocator.blueprintFactory);
        }
      }
    }

    // 玩家战败后：普通战斗执行复活传送，演武只结算贡献不触发死亡流程
    if (reason === 'defeat' && player instanceof PlayerBase) {
      if (combat.mode === 'spar') {
        if (ServiceLocator.sectManager) {
          ServiceLocator.sectManager.onSparFinished(player, enemy, false);
        }
      } else {
        await player.revive();
        const room = player.getEnvironment() as RoomBase | null;
        if (room) {
          sendRoomInfo(player, room, ServiceLocator.blueprintFactory);
          room.broadcast(`${player.getName()}在此处苏醒了。`, player);
        }
      }
    }

    this.logger.log(
      `战斗结束[${combat.mode}]: ${player.getName()} vs ${enemy.getName()} (${reason})`,
    );
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

    // 逃跑失败 → 浪费出手，gauge 重置为 0，状态回到 CHARGING
    fleerParticipant.gauge = 0;
    fleerParticipant.state = CombatParticipantState.CHARGING;
    if (fleerParticipant.actionTimeout) {
      clearTimeout(fleerParticipant.actionTimeout);
      fleerParticipant.actionTimeout = undefined;
    }

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
   *
   * ATB 算法:
   *   1. AWAITING_ACTION 状态跳过 gauge 累积
   *   2. gauge += speed * SPEED_FACTOR
   *   3. gauge >= MAX_GAUGE 时:
   *      - 玩家: 进入 AWAITING_ACTION，推送选招面板，设超时
   *      - NPC:  直接执行 AI 攻击
   */
  private processCombat(combat: CombatInstance): void {
    const { MAX_GAUGE, SPEED_FACTOR } = COMBAT_CONSTANTS;
    const actions: CombatAction[] = [];

    for (const participant of combat.participants.values()) {
      // 跳过已死亡的参与者
      if (participant.entity.getCombatState() === 'dead') continue;

      // AWAITING_ACTION 状态: 跳过 gauge 累积，等待玩家选招
      if (participant.state === CombatParticipantState.AWAITING_ACTION) {
        continue;
      }

      const speed = participant.entity.getCombatSpeed();
      const fillRate = speed * SPEED_FACTOR;

      participant.gauge += fillRate;

      // gauge 达到阈值时触发行动
      while (participant.gauge >= MAX_GAUGE) {
        const isPlayer = participant.entity instanceof PlayerBase;
        const player = isPlayer ? (participant.entity as PlayerBase) : null;

        // 玩家: 检查是否有技能可选，有则进入选招阶段
        if (isPlayer && player) {
          const skillMgr = this.getSkillManager(player);
          if (skillMgr) {
            const availableActions = skillMgr.getAvailableCombatActions();
            if (availableActions.length > 0) {
              // 进入 AWAITING_ACTION 状态，不扣 gauge（保留在 MAX_GAUGE 之上）
              participant.state = CombatParticipantState.AWAITING_ACTION;

              // 推送 combatAwaitAction 消息
              const awaitData: CombatAwaitActionData = {
                combatId: combat.id,
                timeoutMs: SKILL_CONSTANTS.ACTION_TIMEOUT_MS,
                availableActions,
              };
              this.sendToPlayer(player, 'combatAwaitAction', awaitData);

              // 设置选招超时定时器
              participant.actionTimeout = setTimeout(() => {
                this.handleActionTimeout(combat.id, player.id);
              }, SKILL_CONSTANTS.ACTION_TIMEOUT_MS);

              break; // 跳出 while，不再累积本参与者
            }
          }

          // 无可用招式: 按普通攻击处理（向下走 fallthrough）
        }

        // NPC 或无技能玩家: 直接执行普通攻击
        participant.gauge -= MAX_GAUGE;

        const result = DamageEngine.calculate(participant.entity, participant.target);
        const damageResult = this.applyDamage(combat, participant.target, result.damage);

        actions.push({
          attacker: participant.side,
          type: result.type as CombatAction['type'],
          damage: damageResult.appliedDamage,
          isCrit: result.isCrit,
          description: result.description,
        });

        // 检查目标死亡
        if (damageResult.defeated) {
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
  //  技能行动
  // ================================================================

  /**
   * 执行玩家选择的招式行动
   *
   * 流程:
   * 1. 验证参与者处于 AWAITING_ACTION 状态
   * 2. 取消超时定时器
   * 3. 获取可用招式列表，校验 actionIndex
   * 4. 校验资源消耗
   * 5. 计算伤害（含武器匹配检查）
   * 6. 扣除资源、推送战斗日志
   * 7. 重置状态为 CHARGING，gauge = 0
   * 8. 触发战斗领悟判定
   *
   * @param combatId 战斗 ID
   * @param player 玩家实例
   * @param actionIndex 招式选项索引
   * @returns 是否成功执行
   */
  executeSkillAction(combatId: string, player: PlayerBase, actionIndex: number): boolean {
    const combat = this.combats.get(combatId);
    if (!combat) return false;

    const participant = combat.participants.get(player.id);
    if (!participant) return false;

    // 1. 验证状态
    if (participant.state !== CombatParticipantState.AWAITING_ACTION) {
      return false;
    }

    // 2. 取消超时定时器
    if (participant.actionTimeout) {
      clearTimeout(participant.actionTimeout);
      participant.actionTimeout = undefined;
    }

    // 3. 获取可用招式
    const skillMgr = this.getSkillManager(player);
    if (!skillMgr) return false;

    const availableActions = skillMgr.getAvailableCombatActions();
    const actionOption = availableActions.find((a) => a.index === actionIndex);
    if (!actionOption) {
      // 无效索引，自动使用普攻
      this.executeAutoAttack(combat, participant, player);
      return false;
    }

    // 4. 校验可用性（资源是否足够 + 冷却是否完毕）
    const cooldownKey = `${actionOption.skillId}::${actionOption.actionName}`;
    const cooldownLeft = participant.actionCooldowns.get(cooldownKey) ?? 0;
    if (cooldownLeft > 0) {
      this.sendToPlayer(player, 'toast', { content: '招式冷却中，无法使用。' });
      this.executeAutoAttack(combat, participant, player);
      return false;
    }
    if (!actionOption.canUse) {
      this.sendToPlayer(player, 'toast', { content: '资源不足，无法使用该招式。' });
      this.executeAutoAttack(combat, participant, player);
      return false;
    }

    // 5. 获取招式定义（从 SkillRegistry 获取完整 SkillAction）
    const skillAction = this.resolveSkillAction(
      skillMgr,
      actionOption.skillId,
      actionOption.actionName,
    );
    if (!skillAction) {
      this.executeAutoAttack(combat, participant, player);
      return false;
    }

    // 6. 武器匹配检查（仅兵刃武学需要）
    const weaponMismatch = this.checkWeaponMismatch(player, actionOption.skillId);

    // 7. 计算伤害
    const result = DamageEngine.calculateWithAction(participant.entity, participant.target, {
      action: skillAction,
      weaponMismatch,
    });

    // 8. 扣除资源
    for (const cost of skillAction.costs) {
      const current = player.get<number>(cost.resource) ?? 0;
      player.set(cost.resource, Math.max(0, current - cost.amount));
    }

    // 9. 应用伤害（演武模式下做非致死处理）
    const damageResult = this.applyDamage(combat, participant.target, result.damage);

    // 10. 推送战斗日志
    const actions: CombatAction[] = [
      {
        attacker: participant.side,
        type: result.type as CombatAction['type'],
        damage: damageResult.appliedDamage,
        isCrit: result.isCrit,
        description: result.description,
      },
    ];

    // 11. 重置状态
    participant.state = CombatParticipantState.CHARGING;
    participant.gauge = 0;

    // 11.5 冷却处理：先递减所有现存冷却（本次出手算 1 回合），再设置本招冷却
    this.tickCooldowns(participant);
    const actionCooldown = skillAction.cooldown ?? 0;
    if (actionCooldown > 0) {
      participant.actionCooldowns.set(cooldownKey, actionCooldown);
    }

    // 12. 检查目标死亡
    if (damageResult.defeated) {
      const reason: CombatEndReason = participant.side === 'player' ? 'victory' : 'defeat';
      this.sendCombatUpdate(combat, actions);
      this.endCombat(combat.id, reason);
    } else {
      this.sendCombatUpdate(combat, actions);
    }

    // 13. 战斗领悟判定
    skillMgr.onCombatSkillUse(actionOption.skillId);

    return true;
  }

  /**
   * 选招超时处理
   * 超时后自动使用普通攻击，重置状态
   *
   * @param combatId 战斗 ID
   * @param playerId 玩家实体 ID
   */
  handleActionTimeout(combatId: string, playerId: string): void {
    const combat = this.combats.get(combatId);
    if (!combat) return;

    const participant = combat.participants.get(playerId);
    if (!participant) return;

    // 只处理仍在等待行动的参与者
    if (participant.state !== CombatParticipantState.AWAITING_ACTION) return;

    // 清除定时器引用
    participant.actionTimeout = undefined;

    const player =
      participant.entity instanceof PlayerBase ? (participant.entity as PlayerBase) : null;
    if (player) {
      this.sendToPlayer(player, 'toast', { content: '选招超时，自动使用普通攻击。' });
    }

    // 执行普通攻击
    this.executeAutoAttack(combat, participant, player);
  }

  // ================================================================
  //  消息推送
  // ================================================================

  /** 推送 combatUpdate 消息（自动附带最新招式列表） */
  private sendCombatUpdate(combat: CombatInstance, actions: CombatAction[]): void {
    const playerParticipant = combat.participants.get(combat.player.id);
    const enemyParticipant = combat.participants.get(combat.enemy.id);
    if (!playerParticipant || !enemyParticipant) return;

    const updateData: CombatUpdateData = {
      combatId: combat.id,
      actions,
      player: {
        hp: combat.player.get<number>('hp') ?? 0,
        maxHp: combat.player.getMaxHp(),
        atbPct: Math.floor((playerParticipant.gauge / COMBAT_CONSTANTS.MAX_GAUGE) * 100),
      },
      enemy: {
        hp: combat.enemy.get<number>('hp') ?? 0,
        maxHp: combat.enemy.getMaxHp(),
        atbPct: Math.floor((enemyParticipant.gauge / COMBAT_CONSTANTS.MAX_GAUGE) * 100),
      },
    };

    // 附带最新招式列表（含冷却状态）
    if (combat.player instanceof PlayerBase) {
      const skillMgr = this.getSkillManager(combat.player);
      if (skillMgr) {
        updateData.availableActions = this.getActionsWithCooldown(
          combat.player,
          playerParticipant,
          skillMgr,
        );
      }
    }

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
      maxHp: entity.getMaxHp(),
      atbPct: Math.floor((participant.gauge / COMBAT_CONSTANTS.MAX_GAUGE) * 100),
    };
  }

  // ================================================================
  //  胜利奖励
  // ================================================================

  /**
   * 击杀 NPC 后的奖励处理
   * - 通过 ExpManager 发放战斗经验（含等级差衰减）
   * - 通过 QuestManager 更新 kill 类任务进度
   */
  private handleVictoryRewards(player: PlayerBase, npc: NpcBase): void {
    // 经验奖励
    if (ServiceLocator.expManager) {
      const npcLevel = npc.get<number>('level') ?? 1;
      const playerLevel = player.get<number>('level') ?? 1;
      const baseExp = npc.get<number>('combat_exp') ?? npcLevel * 10;
      const finalExp = ServiceLocator.expManager.calculateCombatExp(playerLevel, npcLevel, baseExp);
      if (finalExp > 0) {
        ServiceLocator.expManager.gainCombatExp(player, finalExp);
      }
    }

    // 任务进度：kill 类目标
    if (ServiceLocator.questManager) {
      ServiceLocator.questManager.onNpcDeath(npc, player);
    }
  }

  // ================================================================
  //  辅助方法
  // ================================================================

  /**
   * 执行普通攻击（无招式，用于超时或无可用招式时的 fallback）
   * 重置参与者状态为 CHARGING，gauge = 0
   */
  private executeAutoAttack(
    combat: CombatInstance,
    participant: CombatParticipant,
    player: PlayerBase | null,
  ): void {
    // 重置状态
    participant.state = CombatParticipantState.CHARGING;
    participant.gauge = 0;

    // 普攻也算 1 回合，递减冷却
    this.tickCooldowns(participant);

    // 执行普通攻击
    const result = DamageEngine.calculate(participant.entity, participant.target);
    const damageResult = this.applyDamage(combat, participant.target, result.damage);

    const actions: CombatAction[] = [
      {
        attacker: participant.side,
        type: result.type as CombatAction['type'],
        damage: damageResult.appliedDamage,
        isCrit: result.isCrit,
        description: result.description,
      },
    ];

    // 检查目标死亡
    if (damageResult.defeated) {
      const reason: CombatEndReason = participant.side === 'player' ? 'victory' : 'defeat';
      this.sendCombatUpdate(combat, actions);
      this.endCombat(combat.id, reason);
    } else {
      this.sendCombatUpdate(combat, actions);
    }
  }

  /**
   * 获取玩家的 SkillManager
   * 通过 player 的 temp 数据或公开属性获取
   */
  private getSkillManager(player: PlayerBase): SkillManager | null {
    // SkillManager 挂载于 PlayerBase 实例（由上层初始化时注入）
    return (player as any).skillManager ?? null;
  }

  /**
   * 根据技能 ID 和招式名解析出完整的 SkillAction 定义
   * 用于获取招式的 modifiers 和 costs 详情
   */
  private resolveSkillAction(
    skillMgr: SkillManager,
    skillId: string,
    actionName: string,
  ): SkillAction | null {
    // 遍历 SkillManager 的映射，找到对应技能并获取招式
    const allSkills = skillMgr.getAllSkills();
    const skillData = allSkills.find((s) => s.skillId === skillId);
    if (!skillData) return null;

    // 获取技能定义（通过 SkillRegistry）
    // SkillManager 内部持有 SkillRegistry 引用，但不直接暴露
    // 通过 getAvailableCombatActions 已获取到招式列表，这里需要从 registry 获取完整定义
    // 使用间接方式: 通过 buildSkillInfo 确认技能存在，通过 registry 获取 action
    try {
      // 从 ServiceLocator 获取 SkillRegistry（如果有），否则通过 SkillManager 的间接方法
      const registry = (skillMgr as any).skillRegistry;
      if (!registry) return null;

      const skillDef = registry.get(skillId);
      if (!skillDef) return null;

      // 武学和内功都有 actions 属性
      const actions: SkillAction[] = (skillDef as any).actions;
      if (!actions || !Array.isArray(actions)) return null;

      return actions.find((a: SkillAction) => a.name === actionName) ?? null;
    } catch {
      return null;
    }
  }

  /**
   * 检查武器匹配
   * 兵刃武学（weaponMartial 组）需要装备对应类型的武器
   * 徒手武学不需要武器检查
   *
   * @param player 玩家
   * @param skillId 使用的技能 ID
   * @returns 是否武器不匹配
   */
  private checkWeaponMismatch(player: PlayerBase, skillId: string): boolean {
    const skillMgr = this.getSkillManager(player);
    if (!skillMgr) return false;

    // 获取技能定义
    try {
      const registry = (skillMgr as any).skillRegistry;
      if (!registry) return false;

      const skillDef = registry.get(skillId);
      if (!skillDef) return false;

      // 只检查兵刃武学（有 weaponType 属性的技能）
      if (!('weaponType' in skillDef)) return false;
      const weaponSkill = skillDef as WeaponSkillBase;
      const requiredType = weaponSkill.weaponType;

      // 获取玩家当前装备的武器
      const equipment = player.getEquipment();
      const weaponItem = equipment.get('weapon');

      if (!weaponItem) {
        // 没装备武器，使用兵刃武学算不匹配
        return true;
      }

      if (weaponItem instanceof WeaponBase) {
        return weaponItem.getWeaponType() !== requiredType;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * 应用伤害
   * - 普通战斗：走 receiveDamage，可能触发死亡。
   * - 演武战斗：非致死，最低保留 1 HP。
   */
  private applyDamage(
    combat: CombatInstance,
    target: LivingBase,
    damage: number,
  ): { appliedDamage: number; defeated: boolean } {
    const finalDamage = Math.max(0, Math.floor(damage));
    if (finalDamage <= 0) {
      return { appliedDamage: 0, defeated: false };
    }

    if (combat.mode === 'spar') {
      const currentHp = target.get<number>('hp') ?? 0;
      const nextHp = currentHp - finalDamage;
      if (nextHp <= 0) {
        const appliedDamage = Math.max(0, currentHp - 1);
        target.set('hp', 1);
        return { appliedDamage, defeated: true };
      }
      target.set('hp', nextHp);
      return { appliedDamage: finalDamage, defeated: false };
    }

    target.receiveDamage(finalDamage);
    const aliveHp = target.get<number>('hp') ?? 0;
    return { appliedDamage: finalDamage, defeated: aliveHp <= 0 };
  }

  // ================================================================
  //  冷却系统
  // ================================================================

  /**
   * 获取招式列表（含冷却状态）
   * 在 getAvailableCombatActions 基础上叠加冷却信息
   */
  private getActionsWithCooldown(
    player: PlayerBase,
    participant: CombatParticipant,
    skillMgr: SkillManager,
  ): import('@packages/core').CombatActionOption[] {
    const actions = skillMgr.getAvailableCombatActions();
    return actions.map((action) => {
      const key = `${action.skillId}::${action.actionName}`;
      const cooldownRemaining = participant.actionCooldowns.get(key) ?? 0;
      return {
        ...action,
        cooldownRemaining,
        // 冷却中不可用
        canUse: cooldownRemaining > 0 ? false : action.canUse,
      };
    });
  }

  /**
   * 递减参与者所有冷却值（每次出手算 1 回合）
   * 冷却降为 0 时自动移除
   */
  private tickCooldowns(participant: CombatParticipant): void {
    for (const [key, remaining] of participant.actionCooldowns) {
      if (remaining <= 1) {
        participant.actionCooldowns.delete(key);
      } else {
        participant.actionCooldowns.set(key, remaining - 1);
      }
    }
  }

  // ================================================================
  //  清理
  // ================================================================

  /** 清理战斗实例和双方状态 */
  private cleanupCombat(combat: CombatInstance): void {
    // 清理参与者的战斗状态和超时定时器
    for (const participant of combat.participants.values()) {
      // 清除选招超时定时器
      if (participant.actionTimeout) {
        clearTimeout(participant.actionTimeout);
        participant.actionTimeout = undefined;
      }

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
