/**
 * 门派管理器
 * 负责拜师、捐献、演武结算、叛门惩罚和 NPC 动作可见性。
 */
import { Injectable, Logger } from '@nestjs/common';
import { rt } from '@packages/core';
import type { CommandResult } from '../types/command';
import type { ItemBase } from '../game-objects/item-base';
import type { LivingBase } from '../game-objects/living-base';
import type { NpcBase } from '../game-objects/npc-base';
import { PlayerBase } from '../game-objects/player-base';
import type { PlayerSectData } from './types';
import { clonePlayerSectData, normalizePlayerSectData } from './types';
import { SectRegistry } from './sect-registry';
import type { SectPolicy } from './policies/sect-policy';

@Injectable()
export class SectManager {
  private readonly logger = new Logger(SectManager.name);

  constructor(private readonly registry: SectRegistry) {}

  /** 获取并归一化玩家门派数据 */
  getPlayerSectData(player: PlayerBase): PlayerSectData {
    const normalized = normalizePlayerSectData(player.get('sect'));
    this.savePlayerSectData(player, normalized);
    return normalized;
  }

  /** 保存玩家门派数据回 dbase */
  savePlayerSectData(player: PlayerBase, data: PlayerSectData): void {
    player.set('sect', clonePlayerSectData(data));
  }

  /** 读取当前门派 ID */
  getCurrentSectId(player: PlayerBase): string | null {
    const data = this.getPlayerSectData(player);
    return data.current?.sectId ?? null;
  }

  /** 判断玩家是否与 NPC 同门 */
  isSameSectWithNpc(player: PlayerBase, npc: NpcBase): boolean {
    const data = this.getPlayerSectData(player);
    const npcSectId = this.getNpcSectId(npc);
    return !!data.current && !!npcSectId && data.current.sectId === npcSectId;
  }

  /**
   * NPC 门派交互动作可见性
   * 简单 if/if 规则，避免出现不必要按钮。
   */
  getNpcAvailableActions(player: LivingBase, npc: NpcBase): string[] {
    if (!(player instanceof PlayerBase)) return [];

    const policy = this.getPolicyByNpc(npc);
    if (!policy) return [];

    const role = this.getNpcSectRole(npc);
    const data = this.getPlayerSectData(player);
    const actions: string[] = [];

    if (!data.current) {
      if (role === 'mentor' && !data.restrictions.bannedSectIds.includes(policy.sectId)) {
        actions.push('apprentice');
      }
      return actions;
    }

    if (data.current.sectId !== policy.sectId) return actions;

    if (role === 'deacon') {
      actions.push('donate');
    }
    if (role === 'sparring' && this.canStartSpar(player, npc) === true) {
      actions.push('spar');
    }
    if (role === 'master' || role === 'deacon') {
      actions.push('betray');
    }

    return actions;
  }

  apprentice(player: PlayerBase, master: NpcBase): CommandResult {
    const policy = this.getPolicyByNpc(master);
    if (!policy) {
      return { success: false, message: '此人并非门中可收徒之人。' };
    }

    const role = this.getNpcSectRole(master);
    if (role !== 'mentor') {
      return { success: false, message: `${master.getName()}道：「收徒之事，先去弟子院找何教习。」` };
    }

    const data = this.getPlayerSectData(player);
    if (data.current) {
      if (data.current.sectId === policy.sectId) {
        return { success: false, message: `你已是${policy.sectName}门人。` };
      }
      return { success: false, message: '你已有师门。若执意改投，请先行叛门。' };
    }

    if (data.restrictions.bannedSectIds.includes(policy.sectId)) {
      return { success: false, message: `你已被${policy.sectName}永拒门外。` };
    }

    if (
      typeof data.restrictions.cooldownUntil === 'number' &&
      Date.now() < data.restrictions.cooldownUntil
    ) {
      return { success: false, message: '你心性未稳，暂不可再拜新门。' };
    }

    const canApprentice = policy.canApprentice(player, master, data);
    if (canApprentice !== true) {
      return { success: false, message: canApprentice };
    }

    data.current = {
      sectId: policy.sectId,
      sectName: policy.sectName,
      masterNpcId: master.id.split('#')[0],
      masterName: master.getName(),
      rank: policy.resolveRankByContribution(0),
      contribution: 0,
      joinedAt: Date.now(),
    };
    this.savePlayerSectData(player, data);

    const msg =
      `${rt('npc', master.getName())}看你良久，沉声道：「自今日起，你便入我${policy.sectName}门墙。」\n` +
      `${rt('sys', `你已加入${policy.sectName}，当前身份：${data.current.rank}`)}`;

    this.logger.log(`${player.getName()} 拜入门派: ${policy.sectId}`);
    return {
      success: true,
      message: msg,
      data: {
        action: 'apprentice',
        sectId: policy.sectId,
        sectName: policy.sectName,
      },
    };
  }

  donate(player: PlayerBase, deacon: NpcBase, item: ItemBase): CommandResult {
    const policy = this.getPolicyByNpc(deacon);
    if (!policy) return { success: false, message: '对方不受理门中捐献。' };

    const role = this.getNpcSectRole(deacon);
    if (role !== 'deacon') {
      return { success: false, message: `${deacon.getName()}不掌管门中账册。` };
    }

    const data = this.getPlayerSectData(player);
    if (!data.current || data.current.sectId !== policy.sectId) {
      return { success: false, message: '你并非本门弟子，不能在此捐献。' };
    }

    const equipped = player.findEquipped((equippedItem) => equippedItem.id === item.id);
    if (equipped) {
      return { success: false, message: `你正装备着${item.getName()}，请先卸下再捐献。` };
    }

    const evaluate = policy.evaluateDonation(player, deacon, item);
    if (!evaluate.allowed || evaluate.contribution <= 0) {
      return {
        success: false,
        message: evaluate.reason || `${deacon.getName()}摇头道：「此物不入门中账目。」`,
      };
    }

    const oldRank = data.current.rank;
    item.destroy();
    data.current.contribution += evaluate.contribution;
    data.current.rank = policy.resolveRankByContribution(data.current.contribution);
    this.savePlayerSectData(player, data);

    const rankUpText = data.current.rank !== oldRank ? `\n${rt('imp', `你的门中身份提升为：${data.current.rank}`)}` : '';

    return {
      success: true,
      message:
        `你将${rt('item', item.getName())}交予${rt('npc', deacon.getName())}入账，` +
        `获得门派贡献 ${evaluate.contribution}（总计 ${data.current.contribution}）。${rankUpText}`,
      data: {
        action: 'donate',
        sectId: policy.sectId,
        contributionGain: evaluate.contribution,
        contributionTotal: data.current.contribution,
      },
    };
  }

  canStartSpar(player: PlayerBase, trainer: NpcBase): true | string {
    const policy = this.getPolicyByNpc(trainer);
    if (!policy) return '此人不主持门中演武。';

    const role = this.getNpcSectRole(trainer);
    if (role !== 'sparring') {
      return `${trainer.getName()}并不负责门中演武。`;
    }

    const data = this.getPlayerSectData(player);
    if (!data.current || data.current.sectId !== policy.sectId) {
      return '你并非本门弟子，不能参与本门演武。';
    }

    this.normalizeDaily(data);
    if (data.daily.sparCount >= 1) {
      return '你今日演武已满一次，且回去温养气息。';
    }
    return true;
  }

  /** 消耗当日演武次数（开战前调用） */
  reserveSparAttempt(player: PlayerBase): void {
    const data = this.getPlayerSectData(player);
    this.normalizeDaily(data);
    data.daily.sparCount += 1;
    this.savePlayerSectData(player, data);
  }

  /** 演武结束结算门派贡献 */
  onSparFinished(player: PlayerBase, opponent: LivingBase, victory: boolean): void {
    const data = this.getPlayerSectData(player);
    if (!data.current) return;

    const policy = this.registry.get(data.current.sectId);
    if (!policy) return;

    const reward = policy.resolveSparReward(player, opponent, victory);
    if (reward.contribution <= 0) return;

    const oldRank = data.current.rank;
    data.current.contribution += reward.contribution;
    data.current.rank = policy.resolveRankByContribution(data.current.contribution);
    this.savePlayerSectData(player, data);

    const rankText =
      data.current.rank !== oldRank ? ` 当前身份升为${data.current.rank}。` : '';
    player.receiveMessage(
      `${rt('sys', `演武结算：门派贡献 +${reward.contribution}`)}\n${reward.summary}${rankText}`,
    );
  }

  betray(player: PlayerBase, witness: NpcBase): CommandResult {
    const data = this.getPlayerSectData(player);
    if (!data.current) {
      return { success: false, message: '你本就无门无派。' };
    }

    const currentSectId = data.current.sectId;
    const witnessPolicy = this.getPolicyByNpc(witness);
    if (!witnessPolicy || witnessPolicy.sectId !== currentSectId) {
      return { success: false, message: '你须当着本门长辈立誓叛门。' };
    }

    const role = this.getNpcSectRole(witness);
    if (role !== 'master' && role !== 'deacon') {
      return { success: false, message: `${witness.getName()}无权受理叛门。` };
    }

    const policy = this.registry.get(currentSectId);
    if (!policy) {
      return { success: false, message: '门规失佚，暂无法受理叛门。' };
    }

    const penalty = policy.applyBetrayalPenalty(player, witness, data);
    const current = data.current;
    let removedSkills: string[] = [];

    if (penalty.removeFactionSkills && player.skillManager) {
      removedSkills = player.skillManager.removeSkillsByFaction(policy.factionRequired);
    }

    if (penalty.clearContribution) {
      current.contribution = 0;
    }
    if (penalty.clearRank) {
      current.rank = '无门无派';
    }

    if (penalty.banForever && !data.restrictions.bannedSectIds.includes(currentSectId)) {
      data.restrictions.bannedSectIds.push(currentSectId);
    }
    if (typeof penalty.cooldownMs === 'number' && penalty.cooldownMs > 0) {
      data.restrictions.cooldownUntil = Date.now() + Math.floor(penalty.cooldownMs);
    } else {
      data.restrictions.cooldownUntil = null;
    }

    data.current = null;
    this.savePlayerSectData(player, data);

    const removedText =
      removedSkills.length > 0
        ? `门中技艺尽数废去（共 ${removedSkills.length} 项）。`
        : '你虽离门，身上并无本门技艺可废。';

    const summary = penalty.summary || `${policy.sectName}门籍已除，永不录入。`;

    return {
      success: true,
      message: `${summary}\n${removedText}`,
      data: {
        action: 'betray',
        sectId: currentSectId,
        removedSkills: removedSkills.length,
      },
    };
  }

  private getNpcSectId(npc: NpcBase): string | null {
    const sectId = npc.get<string>('sect_id');
    return typeof sectId === 'string' && sectId.length > 0 ? sectId : null;
  }

  private getNpcSectRole(npc: NpcBase): string {
    const role = npc.get<string>('sect_role');
    return typeof role === 'string' ? role : '';
  }

  private getPolicyByNpc(npc: NpcBase): SectPolicy | undefined {
    const sectId = this.getNpcSectId(npc);
    if (!sectId) return undefined;
    return this.registry.get(sectId);
  }

  private normalizeDaily(data: PlayerSectData): void {
    const key = this.getTodayKey();
    if (data.daily.dateKey !== key) {
      data.daily.dateKey = key;
      data.daily.sparCount = 0;
    }
  }

  private getTodayKey(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = `${now.getMonth() + 1}`.padStart(2, '0');
    const d = `${now.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
