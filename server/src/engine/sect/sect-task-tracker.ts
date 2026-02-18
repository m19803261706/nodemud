/**
 * 门派任务进度追踪器
 * 监听游戏事件（进入房间、击杀、获取物品、对话），自动更新门派任务目标进度。
 */
import { Injectable, Logger } from '@nestjs/common';
import { rt } from '@packages/core';
import { SectTaskManager } from './sect-task-manager';
import type { PlayerBase } from '../game-objects/player-base';
import type { PlayerSectData } from './types';
import { normalizePlayerSectData } from './types';

@Injectable()
export class SectTaskTracker {
  private readonly logger = new Logger(SectTaskTracker.name);

  constructor(private readonly taskManager: SectTaskManager) {}

  /**
   * 玩家进入房间时调用
   */
  onEnterRoom(player: PlayerBase, roomId: string): void {
    const sectData = this.getPlayerSectData(player);
    if (!sectData.current) return;

    const changed = this.taskManager.updateObjectiveProgress(
      player,
      sectData,
      'goto',
      roomId,
    );

    if (changed) {
      this.notifyProgress(player, sectData);
    }
  }

  /**
   * 玩家击杀 NPC 时调用
   */
  onKillNpc(player: PlayerBase, npcBlueprintId: string): void {
    const sectData = this.getPlayerSectData(player);
    if (!sectData.current) return;

    const changed = this.taskManager.updateObjectiveProgress(
      player,
      sectData,
      'kill',
      npcBlueprintId,
    );

    if (changed) {
      this.notifyProgress(player, sectData);
    }
  }

  /**
   * 玩家获取物品时调用
   */
  onObtainItem(player: PlayerBase, itemBlueprintId: string, count: number = 1): void {
    const sectData = this.getPlayerSectData(player);
    if (!sectData.current) return;

    const changed = this.taskManager.updateObjectiveProgress(
      player,
      sectData,
      'collect',
      itemBlueprintId,
      count,
    );

    if (changed) {
      this.notifyProgress(player, sectData);
    }
  }

  /**
   * 玩家与 NPC 对话时调用
   */
  onTalkToNpc(player: PlayerBase, npcBlueprintId: string): void {
    const sectData = this.getPlayerSectData(player);
    if (!sectData.current) return;

    const changed = this.taskManager.updateObjectiveProgress(
      player,
      sectData,
      'dialogue',
      npcBlueprintId,
    );

    if (changed) {
      this.notifyProgress(player, sectData);
    }
  }

  // ========== 私有方法 ==========

  /** 获取玩家门派数据 */
  private getPlayerSectData(player: PlayerBase): PlayerSectData {
    return normalizePlayerSectData(player.get('sect'));
  }

  /** 进度变化时通知玩家 */
  private notifyProgress(player: PlayerBase, sectData: PlayerSectData): void {
    const taskData = sectData.sectTaskData;
    if (!taskData) return;

    // 检查日常任务进度
    if (taskData.activeDailyTask) {
      const task = taskData.activeDailyTask;
      const allDone = task.objectives.every((obj) => obj.current >= obj.count);
      if (allDone) {
        player.receiveMessage(
          rt('imp', '日常任务') +
            rt('skill', task.name) +
            rt('imp', '目标已达成！') +
            rt('sys', '请找执事交付任务。'),
        );
      } else {
        // 显示进度
        for (const obj of task.objectives) {
          if (obj.current > 0 && obj.current < obj.count) {
            player.receiveMessage(
              rt('sys', `[门派任务] ${obj.description}（${obj.current}/${obj.count}）`),
            );
          }
        }
      }
    }

    // 检查周常任务进度
    if (taskData.activeWeeklyTask) {
      const task = taskData.activeWeeklyTask;
      const allDone = task.objectives.every((obj) => obj.current >= obj.count);
      if (allDone) {
        player.receiveMessage(
          rt('imp', '周常任务') +
            rt('skill', task.name) +
            rt('imp', '目标已达成！') +
            rt('sys', '请找执事交付任务。'),
        );
      } else {
        for (const obj of task.objectives) {
          if (obj.current > 0 && obj.current < obj.count) {
            player.receiveMessage(
              rt('sys', `[门派任务] ${obj.description}（${obj.current}/${obj.count}）`),
            );
          }
        }
      }
    }
  }
}
