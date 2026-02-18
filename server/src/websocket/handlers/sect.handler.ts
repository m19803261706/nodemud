/**
 * 门派系统处理器
 * 处理门派信息请求和门派传送
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  MessageFactory,
  type SectInfoResponseData,
  type SectOverviewData,
  type SectSkillNode,
  type SectProgressData,
  type SectNpcLocations,
  type SectNpcLocation,
  type SectRankInfo,
  type SectTeleportRole,
} from '@packages/core';
import { ObjectManager } from '../../engine/object-manager';
import { BlueprintFactory } from '../../engine/blueprint-factory';
import { SectManager } from '../../engine/sect/sect-manager';
import { SectRegistry } from '../../engine/sect/sect-registry';
import { ServiceLocator } from '../../engine/service-locator';
import { NpcBase } from '../../engine/game-objects/npc-base';
import type { PlayerBase } from '../../engine/game-objects/player-base';
import type { RoomBase } from '../../engine/game-objects/room-base';
import { sendRoomInfo } from './room-utils';
import type { Session } from '../types/session';
import {
  SONGYANG_SKILL_META,
  SONGYANG_FACTION_ID,
} from '../../engine/skills/songyang/songyang-skill-meta';
import { SONGYANG_SKILL_ID_LIST } from '../../engine/skills/songyang/songyang-skill-ids';
import type { SongyangSkillId } from '../../engine/skills/songyang/songyang-skill-ids';
import {
  evaluateSongyangSkillUnlock,
  describeSongyangUnlockRules,
} from '../../engine/skills/songyang/songyang-unlock-evaluator';

/** 传送角色对应的日志文案 */
const TELEPORT_LOG: Record<SectTeleportRole, string> = {
  deacon: '[sys]你循着记忆中的路径，快步赶往[rn]执事堂[/rn]。[/sys]',
  sparring: '[sys]你整了整衣袍，大步走向[rn]演武场[/rn]。[/sys]',
  master: '[sys]你恭敬地前往师父所在的[rn]殿阁[/rn]。[/sys]',
};

@Injectable()
export class SectHandler {
  private readonly logger = new Logger(SectHandler.name);

  constructor(
    private readonly objectManager: ObjectManager,
    private readonly blueprintFactory: BlueprintFactory,
    private readonly sectManager: SectManager,
    private readonly sectRegistry: SectRegistry,
  ) {}

  /**
   * 处理门派信息请求 — 返回门派概览、技能树、进度、NPC 位置
   */
  async handleSectInfoRequest(session: Session): Promise<void> {
    const player = this.getPlayerFromSession(session);
    if (!player) return;

    const sectData = this.sectManager.getPlayerSectData(player);

    // 未入门：返回全 null
    if (!sectData.current) {
      this.sendSectInfoResponse(player, {
        overview: null,
        skillTree: null,
        progress: null,
        npcLocations: null,
      });
      return;
    }

    const sectId = sectData.current.sectId;
    const policy = this.sectRegistry.get(sectId);

    // 组装概览
    const overview = this.buildOverview(sectData.current, policy?.ranks ?? []);

    // 组装技能树（当前仅支持嵩阳）
    const skillTree = sectId === SONGYANG_FACTION_ID
      ? this.buildSongyangSkillTree(player)
      : [];

    // 组装进度
    const progress = this.buildProgress(sectData);

    // 组装 NPC 位置
    const npcLocations = this.buildNpcLocations(sectId);

    this.sendSectInfoResponse(player, {
      overview,
      skillTree,
      progress,
      npcLocations,
    });
  }

  /**
   * 处理门派传送请求
   */
  async handleSectTeleport(
    client: any,
    session: Session,
    data: { targetRole: SectTeleportRole },
  ): Promise<void> {
    const player = this.getPlayerFromSession(session);
    if (!player) return;

    // 战斗中禁止传送
    if (player.isInCombat()) {
      this.sendToast(player, '战斗中无法传送');
      return;
    }

    // 修炼中禁止传送
    if (ServiceLocator.practiceManager?.isInPractice(player)) {
      this.sendToast(player, '修炼中无法传送');
      return;
    }

    // 检查玩家是否已入门
    const sectData = this.sectManager.getPlayerSectData(player);
    if (!sectData.current) {
      this.sendToast(player, '你尚未加入任何门派');
      return;
    }

    const sectId = sectData.current.sectId;
    const targetRole = data.targetRole;

    // 查找目标 NPC
    const npcLocation = this.findNpcLocation(sectId, targetRole);
    if (!npcLocation) {
      this.sendToast(player, '暂时找不到目标');
      return;
    }

    // 获取目标房间
    const targetRoom = this.objectManager.findById(npcLocation.roomId) as RoomBase | undefined;
    if (!targetRoom) {
      this.sendToast(player, '暂时找不到目标');
      return;
    }

    // 检查是否已在目标房间
    const currentRoom = player.getEnvironment() as RoomBase | null;
    if (currentRoom && currentRoom.id === targetRoom.id) {
      this.sendToast(player, '你已在此处');
      return;
    }

    // 旧房间广播离去消息
    if (currentRoom) {
      currentRoom.broadcast(`${player.getName()}匆匆离去。`, player);
    }

    // 执行传送
    await player.moveTo(targetRoom, { quiet: true });

    // 发送传送日志
    const logText = TELEPORT_LOG[targetRole] ?? '[sys]你动身前往门中要地。[/sys]';
    player.receiveMessage(logText);

    // 推送新房间信息
    sendRoomInfo(player, targetRoom, this.blueprintFactory);

    // 新房间广播到达消息
    targetRoom.broadcast(`${player.getName()}匆匆赶到。`, player);
  }

  // ================================================================
  //  内部方法
  // ================================================================

  /** 组装门派概览数据 */
  private buildOverview(
    current: NonNullable<ReturnType<SectManager['getPlayerSectData']>['current']>,
    ranks: { rank: string; minContribution: number }[],
  ): SectOverviewData {
    const rankInfoList: SectRankInfo[] = ranks.map((r) => ({
      rank: r.rank,
      minContribution: r.minContribution,
    }));

    // 计算 nextRank：当前职位在阶梯中的位置 +1
    let nextRank: SectRankInfo | null = null;
    const currentIdx = ranks.findIndex((r) => r.rank === current.rank);
    if (currentIdx >= 0 && currentIdx < ranks.length - 1) {
      const next = ranks[currentIdx + 1];
      nextRank = { rank: next.rank, minContribution: next.minContribution };
    }

    return {
      sectId: current.sectId,
      sectName: current.sectName,
      rank: current.rank,
      contribution: current.contribution,
      masterName: current.masterName,
      joinedAt: current.joinedAt,
      ranks: rankInfoList,
      nextRank,
    };
  }

  /** 组装嵩阳技能树 */
  private buildSongyangSkillTree(player: PlayerBase): SectSkillNode[] {
    const nodes: SectSkillNode[] = [];

    for (const skillId of SONGYANG_SKILL_ID_LIST) {
      const meta = SONGYANG_SKILL_META[skillId];
      const unlockResult = evaluateSongyangSkillUnlock(player, skillId);
      const unlockConditions = describeSongyangUnlockRules(skillId);
      const currentLevel = player.skillManager?.getSkillLevel(skillId) ?? 0;

      nodes.push({
        skillId: meta.skillId,
        skillName: meta.skillName,
        slot: meta.slot,
        tier: meta.tier,
        unlockState: unlockResult.state,
        unlockMessage: unlockResult.message,
        currentLevel,
        unlockConditions,
      });
    }

    return nodes;
  }

  /** 组装日常/进度数据 */
  private buildProgress(sectData: ReturnType<SectManager['getPlayerSectData']>): SectProgressData {
    const songyang = sectData.songyangSkill;
    const puzzle = songyang?.puzzle;
    const challenges = songyang?.challenges;

    return {
      daily: {
        sparCount: sectData.daily.sparCount,
        sparLimit: 1,
      },
      puzzle: {
        canjuCollected: puzzle?.canjuCollected ?? 0,
        canjuState: puzzle?.canjuState ?? 'not_started',
        duanjuState: puzzle?.duanjuState ?? 'not_started',
        shiyanState: puzzle?.shiyanState ?? 'not_started',
      },
      challenges: {
        chiefDiscipleWin: challenges?.chiefDiscipleWin ?? false,
        sparStreakWin: challenges?.sparStreakWin ?? false,
        masterApproval: challenges?.masterApproval ?? false,
      },
    };
  }

  /** 组装 NPC 位置映射 */
  private buildNpcLocations(sectId: string): SectNpcLocations {
    return {
      master: this.findNpcLocation(sectId, 'master'),
      deacon: this.findNpcLocation(sectId, 'deacon'),
      sparring: this.findNpcLocation(sectId, 'sparring'),
    };
  }

  /** 查找指定门派+角色的 NPC 位置 */
  private findNpcLocation(sectId: string, role: string): SectNpcLocation | null {
    const npcs = this.objectManager.findAll(
      (e) =>
        e instanceof NpcBase &&
        !e.destroyed &&
        e.get<string>('sect_id') === sectId &&
        e.get<string>('sect_role') === role,
    );

    if (npcs.length === 0) return null;

    const npc = npcs[0] as NpcBase;
    const room = npc.getEnvironment();
    if (!room) return null;

    return {
      npcId: npc.id,
      npcName: npc.getName(),
      roomId: room.id,
    };
  }

  /** 发送门派信息响应 */
  private sendSectInfoResponse(player: PlayerBase, data: SectInfoResponseData): void {
    const msg = MessageFactory.create('sectInfoResponse', data);
    if (msg) {
      player.sendToClient(MessageFactory.serialize(msg));
    }
  }

  /** 发送 toast 提示 */
  private sendToast(player: PlayerBase, message: string): void {
    const msg = MessageFactory.create('toast', message);
    if (msg) {
      player.sendToClient(MessageFactory.serialize(msg));
    }
  }

  /** 从 session 获取玩家对象 */
  private getPlayerFromSession(session: Session): PlayerBase | undefined {
    if (!session.authenticated || !session.playerId) return undefined;
    return this.objectManager.findById(session.playerId) as PlayerBase | undefined;
  }
}
