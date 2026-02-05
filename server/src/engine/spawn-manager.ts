/**
 * SpawnManager — NPC 刷新管理器
 *
 * 服务启动时读取所有 Area 的 spawn_rules，
 * 克隆 NPC 蓝图实例并放置到指定房间，启用心跳驱动 AI。
 */
import { Injectable, Logger } from '@nestjs/common';
import { ObjectManager } from './object-manager';
import { BlueprintFactory } from './blueprint-factory';
import { Area } from './game-objects/area';
import { NpcBase } from './game-objects/npc-base';
import { ItemBase } from './game-objects/item-base';
import { LivingBase } from './game-objects/living-base';
import type { SpawnRule } from './game-objects/area';

/** NPC 心跳间隔（毫秒） */
const NPC_HEARTBEAT_INTERVAL = 2000;

@Injectable()
export class SpawnManager {
  private readonly logger = new Logger(SpawnManager.name);

  constructor(
    private readonly objectManager: ObjectManager,
    private readonly blueprintFactory: BlueprintFactory,
  ) {}

  /** 读取所有 Area 的 spawn_rules，执行初始刷新 */
  spawnAll(): void {
    const areas = this.objectManager.findAll((e) => e instanceof Area) as Area[];
    let totalNpcSpawned = 0;
    let totalItemSpawned = 0;

    for (const area of areas) {
      // NPC 刷新
      const npcRules = area.getSpawnRules();
      for (const rule of npcRules) {
        totalNpcSpawned += this.spawnByRule(rule);
      }

      // 物品刷新
      const itemRules = area.getItemSpawnRules();
      for (const rule of itemRules) {
        totalItemSpawned += this.spawnItemByRule(rule);
      }
    }

    this.logger.log(`NPC 刷新完成，共刷新 ${totalNpcSpawned} 个 NPC`);
    if (totalItemSpawned > 0) {
      this.logger.log(`物品刷新完成，共放置 ${totalItemSpawned} 个物品`);
    }
  }

  /** 按规则刷新 NPC */
  private spawnByRule(rule: SpawnRule): number {
    let spawned = 0;

    for (let i = 0; i < rule.count; i++) {
      try {
        const npc = this.blueprintFactory.clone(rule.blueprintId);
        const room = this.objectManager.findById(rule.roomId);

        if (!room) {
          this.logger.warn(`刷新失败: 房间 ${rule.roomId} 不存在`);
          continue;
        }

        // 初始化 NPC 装备
        const equipConfig = (npc as NpcBase).get<{ blueprintId: string; position: string }[]>(
          'equipment',
        );
        if (equipConfig && equipConfig.length > 0) {
          for (const { blueprintId, position } of equipConfig) {
            try {
              const item = this.blueprintFactory.clone(blueprintId);
              (npc as LivingBase).equip(item as ItemBase, position);
            } catch (err) {
              this.logger.warn(`NPC 装备初始化失败: ${blueprintId} → ${err}`);
            }
          }
        }

        npc.moveTo(room, { quiet: true });
        npc.enableHeartbeat(NPC_HEARTBEAT_INTERVAL);

        const name = (npc as NpcBase).getName?.() ?? npc.id;
        this.logger.log(`刷新 NPC: ${name} → ${rule.roomId}`);
        spawned++;
      } catch (err) {
        this.logger.error(`刷新 NPC ${rule.blueprintId} 失败: ${err}`);
      }
    }

    return spawned;
  }

  /**
   * 延迟重生 NPC
   * NPC 死亡后调用此方法，在指定延迟后重新克隆蓝图并放入房间
   * @param blueprintId 蓝图 ID
   * @param roomId 目标房间 ID
   * @param delayMs 延迟时间（毫秒）
   */
  scheduleRespawn(blueprintId: string, roomId: string, delayMs: number): void {
    this.logger.log(`计划重生: ${blueprintId} → ${roomId} (${delayMs}ms 后)`);
    setTimeout(() => {
      this.respawnNpc(blueprintId, roomId);
    }, delayMs);
  }

  /**
   * 立即重生 NPC
   * 克隆蓝图创建新 NPC 实例并放入指定房间
   * @param blueprintId 蓝图 ID
   * @param roomId 目标房间 ID
   */
  respawnNpc(blueprintId: string, roomId: string): void {
    try {
      const npc = this.blueprintFactory.clone(blueprintId);
      const room = this.objectManager.findById(roomId);

      if (!room) {
        this.logger.warn(`重生失败: 房间 ${roomId} 不存在`);
        return;
      }

      // 初始化 NPC 装备
      const equipConfig = (npc as NpcBase).get<{ blueprintId: string; position: string }[]>(
        'equipment',
      );
      if (equipConfig && equipConfig.length > 0) {
        for (const { blueprintId: eqBlueprintId, position } of equipConfig) {
          try {
            const item = this.blueprintFactory.clone(eqBlueprintId);
            (npc as LivingBase).equip(item as ItemBase, position);
          } catch (err) {
            this.logger.warn(`重生 NPC 装备初始化失败: ${eqBlueprintId} → ${err}`);
          }
        }
      }

      npc.moveTo(room, { quiet: true });
      npc.enableHeartbeat(NPC_HEARTBEAT_INTERVAL);

      const name = (npc as NpcBase).getName?.() ?? npc.id;
      this.logger.log(`NPC 重生完成: ${name} → ${roomId}`);
    } catch (err) {
      this.logger.error(`NPC 重生失败 ${blueprintId}: ${err}`);
    }
  }

  /** 按规则放置物品 */
  private spawnItemByRule(rule: SpawnRule): number {
    let spawned = 0;

    for (let i = 0; i < rule.count; i++) {
      try {
        const item = this.blueprintFactory.clone(rule.blueprintId);
        const room = this.objectManager.findById(rule.roomId);

        if (!room) {
          this.logger.warn(`物品放置失败: 房间 ${rule.roomId} 不存在`);
          continue;
        }

        item.moveTo(room, { quiet: true });

        const name = (item as ItemBase).getName?.() ?? item.id;
        this.logger.log(`放置物品: ${name} → ${rule.roomId}`);
        spawned++;
      } catch (err) {
        this.logger.error(`放置物品 ${rule.blueprintId} 失败: ${err}`);
      }
    }

    return spawned;
  }
}
