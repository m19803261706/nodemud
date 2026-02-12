/**
 * look 指令 -- 查看当前位置或指定对象
 *
 * 无参数时显示当前房间信息（描述、出口、房间内对象列表）。
 * 有参数时在当前环境中搜索目标并显示其详细描述。
 *
 * 对标: LPC look / 炎黄 look_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import { LivingBase } from '../../game-objects/living-base';
import { NpcBase } from '../../game-objects/npc-base';
import { ItemBase } from '../../game-objects/item-base';
import { ContainerBase } from '../../game-objects/container-base';
import { MerchantBase } from '../../game-objects/merchant-base';
import { RoomBase } from '../../game-objects/room-base';
import { PlayerBase } from '../../game-objects/player-base';
import { BaseEntity } from '../../base-entity';
import { ServiceLocator } from '../../service-locator';
import { rt, bold, getEquipmentTag } from '@packages/core';

@Command({ name: 'look', aliases: ['l', '看'], description: '查看当前位置或指定对象' })
export class LookCommand implements ICommand {
  name = 'look';
  aliases = ['l', '看'];
  description = '查看当前位置或指定对象';
  directory = 'std';

  /**
   * 执行 look 指令
   * @param executor 执行者（LivingBase）
   * @param args 指令参数，空数组表示查看房间，否则查看指定对象
   */
  execute(executor: LivingBase, args: string[]): CommandResult {
    const env = executor.getEnvironment();

    // 不在任何环境中
    if (!env) {
      return { success: false, message: '你不在任何地方。' };
    }

    // 有参数 → 查看指定对象
    if (args.length > 0) {
      return this.lookAtTarget(executor, env, args.join(' '));
    }

    // 无参数 → 查看当前房间
    return this.lookAtRoom(executor, env);
  }

  /** 查看当前房间 */
  private lookAtRoom(executor: LivingBase, env: BaseEntity): CommandResult {
    // 判断是否为 RoomBase
    const isRoom = env instanceof RoomBase;
    const short = isRoom ? (env as RoomBase).getShort() : env.id;
    const long = isRoom ? (env as RoomBase).getLong() : '';
    const exits = isRoom ? (env as RoomBase).getExits() : {};
    const exitNames = Object.keys(exits);

    // 房间内其他对象（排除自己）
    const inventory = env.getInventory().filter((e) => e !== executor);
    const items = inventory.map((e) => {
      // 优先使用 getShort（LivingBase），否则用 id
      if (typeof (e as any).getShort === 'function') {
        return (e as any).getShort() as string;
      }
      return e.id;
    });

    // 根据类型包裹富文本标记
    const taggedItems = inventory.map((e) => {
      const name =
        typeof (e as any).getShort === 'function' ? ((e as any).getShort() as string) : e.id;
      // LivingBase 实例用 npc 标记，其他用 item 标记
      return e instanceof LivingBase ? rt('npc', name) : rt('item', name);
    });

    // 构建消息文本（富文本标记）
    const lines: string[] = [];
    lines.push(rt('rn', bold(short)));
    if (long) lines.push(rt('rd', long));
    if (exitNames.length > 0) {
      lines.push(rt('exit', `出口: ${exitNames.join('、')}`));
    } else {
      lines.push(rt('sys', '这里没有出口。'));
    }
    if (taggedItems.length > 0) {
      lines.push(`${rt('sys', '这里有: ')}${taggedItems.join('、')}`);
    }

    return {
      success: true,
      message: lines.join('\n'),
      data: { short, long, exits: exitNames, items },
    };
  }

  /** 查看指定对象 */
  private lookAtTarget(executor: LivingBase, env: BaseEntity, target: string): CommandResult {
    // 1. 先查玩家背包中的物品
    const bagItem = executor
      .getInventory()
      .filter((e): e is ItemBase => e instanceof ItemBase)
      .find((i) => i.getName().includes(target));
    if (bagItem) {
      return this.lookAtItem(bagItem);
    }

    // 2. 查房间中的 NPC（模糊匹配 getName）
    const inventory = env.getInventory().filter((e) => e !== executor);
    const npc = inventory.find(
      (e) => e instanceof NpcBase && (e as NpcBase).getName().includes(target),
    );
    if (npc) {
      return this.lookAtNpc(npc as NpcBase, executor);
    }

    // 3. 查房间地面的物品
    const groundItem = inventory
      .filter((e): e is ItemBase => e instanceof ItemBase)
      .find((i) => i.getName().includes(target));
    if (groundItem) {
      return this.lookAtItem(groundItem);
    }

    // 4. 精确匹配其他对象（按 getName / getShort / id）
    const lowerTarget = target.toLowerCase();
    const found = env.findInInventory((entity) => {
      if (entity === executor) return false;
      if (entity.id.toLowerCase() === lowerTarget) return true;
      if (typeof (entity as any).getName === 'function') {
        if ((entity as any).getName().toLowerCase() === lowerTarget) return true;
      }
      if (typeof (entity as any).getShort === 'function') {
        if ((entity as any).getShort().toLowerCase() === lowerTarget) return true;
      }
      return false;
    });

    if (!found) {
      return { success: false, message: '这里没有这个东西。' };
    }

    // 获取详细描述
    const long =
      typeof (found as any).getLong === 'function'
        ? (found as any).getLong()
        : `你看到了 ${found.id}。`;

    return {
      success: true,
      message: rt('rd', long),
      data: { target: found.id, long },
    };
  }

  /** 查看物品详细信息 */
  private lookAtItem(item: ItemBase): CommandResult {
    const name = item.getName();
    const long = item.getLong();
    const type = item.getType();
    const weight = item.getWeight();
    const value = item.getValue();

    const lines: string[] = [];
    lines.push(rt('rn', bold(name)));
    lines.push(rt('rd', long));
    lines.push(`类型: ${type}  重量: ${weight}  价值: ${value}`);

    // 容器类物品：展示内容物
    if (item instanceof ContainerBase) {
      const contents = item.getContents();
      if (contents.length > 0) {
        lines.push('');
        lines.push('内容物:');
        for (const child of contents) {
          lines.push(`  ${rt('item', child.getName())}`);
        }
      } else {
        lines.push('');
        lines.push(rt('sys', '空空如也。'));
      }

      const isRemains = item.getType() === 'remains';
      return {
        success: true,
        message: lines.join('\n'),
        data: {
          action: 'look',
          target: 'container',
          containerId: item.id,
          containerName: name,
          isRemains,
          contents: item.getContentsBrief(),
        },
      };
    }

    return {
      success: true,
      message: lines.join('\n'),
      data: {
        action: 'look',
        target: 'item',
        itemId: item.id,
        name,
        long,
        type,
        weight,
        value,
      },
    };
  }

  /** 查看 NPC 详细信息 */
  private lookAtNpc(npc: NpcBase, executor?: LivingBase): CommandResult {
    const name = npc.getName();
    const title = npc.get<string>('title') || '';
    const long = npc.getLong();
    const gender = npc.get<string>('gender') === 'male' ? '男' : '女';
    const inquiry = npc.get<Record<string, string>>('inquiry');
    const canChat =
      typeof npc.get<boolean>('can_chat') === 'boolean'
        ? !!npc.get<boolean>('can_chat')
        : !!inquiry && Object.keys(inquiry).length > 0;

    const canReceiveItemFlag = npc.get<boolean>('can_receive_item');
    const canGive =
      typeof canReceiveItemFlag === 'boolean'
        ? canReceiveItemFlag
        : npc.onReceiveItem !== NpcBase.prototype.onReceiveItem;

    const attackable = npc.get<boolean>('attackable');
    const canAttack =
      typeof attackable === 'boolean' ? attackable : npc.get<boolean>('no_fight') !== true;

    const isMerchant = npc instanceof MerchantBase;
    const canShopList = isMerchant;
    const canShopSell = isMerchant
      ? ((npc as MerchantBase).getRecycleConfig().enabled ?? true)
      : false;
    const teachSkills = this.getNpcTeachSkills(npc);
    const canLearnFromMaster = this.canLearnFromMaster(npc, executor, teachSkills.length > 0);

    const actions: string[] = [];
    if (canChat) actions.push('chat');
    if (canShopList) actions.push('shopList');
    if (canShopSell) actions.push('shopSell');
    if (canGive) actions.push('give');
    if (canAttack) actions.push('attack');
    if (teachSkills.length > 0) actions.push('viewSkills');
    if (canLearnFromMaster) actions.push('learnSkill');

    // 门派交互按钮（简单 if/if 颗粒度控制）
    const sectActions = this.getNpcSectActions(npc, executor);
    if (sectActions.includes('apprentice')) actions.push('apprentice');
    if (sectActions.includes('donate')) actions.push('donate');
    if (sectActions.includes('spar')) actions.push('spar');
    if (sectActions.includes('betray')) actions.push('betray');

    const workActions = this.getNpcWorkActions(npc, executor);
    if (workActions.includes('work')) actions.push('work');
    if (workActions.includes('workStop')) actions.push('workStop');

    const innActions = this.getNpcInnActions(npc);
    if (innActions.includes('rent')) actions.push('rent');

    actions.push('close');

    const header = title ? `${title}·${name}` : name;
    const lines: string[] = [];
    lines.push(rt('rn', bold(header)));
    lines.push(title ? `「${title}」${name} [${gender}]` : `${name} [${gender}]`);
    lines.push(rt('rd', long));

    // NPC 装备展示（逗号分隔）
    const equipment = npc.getEquipment();
    const eqParts: string[] = [];
    const seen = new Set<string>();
    for (const [pos, item] of equipment) {
      if (!item || seen.has(item.id)) continue;
      seen.add(item.id);
      const quality = item.getQuality();
      const wearPos = item.get<string>('wear_position') ?? pos;
      const tag = getEquipmentTag(wearPos, quality);
      eqParts.push(rt(tag, item.getName()));
    }
    if (eqParts.length > 0) {
      lines.push(`装备: ${eqParts.join('、')}`);
    }

    // 构建装备数据
    const eqData: { position: string; name: string; quality: number }[] = [];
    const eqSeen = new Set<string>();
    for (const [pos, eqItem] of equipment) {
      if (!eqItem || eqSeen.has(eqItem.id)) continue;
      eqSeen.add(eqItem.id);
      eqData.push({
        position: pos,
        name: eqItem.getName(),
        quality: eqItem.getQuality(),
      });
    }

    return {
      success: true,
      message: lines.join('\n'),
      data: {
        action: 'look',
        target: 'npc',
        npcId: npc.id,
        name,
        title,
        gender: npc.get<string>('gender') || 'male',
        faction: npc.get<string>('visible_faction') || '',
        level: npc.get<number>('level') || 1,
        hpPct: Math.round(((npc.get<number>('hp') || 0) / (npc.get<number>('max_hp') || 1)) * 100),
        attitude: npc.get<string>('attitude') || 'neutral',
        short: npc.getShort(),
        long,
        equipment: eqData,
        teachSkills,
        actions,
        capabilities: {
          chat: canChat,
          give: canGive,
          attack: canAttack,
          shopList: canShopList,
          shopSell: canShopSell,
          // 兼容旧客户端：保留 shop 总开关
          shop: canShopList || canShopSell,
          // 任务系统：获取 NPC 可用任务摘要
          quests: this.getNpcQuests(npc, executor),
        },
      },
    };
  }

  /**
   * 获取 NPC 任务摘要列表
   * 只有 executor 为玩家时才返回任务信息
   */
  private getNpcQuests(npc: NpcBase, executor?: LivingBase): any[] {
    if (!executor || !(executor instanceof PlayerBase)) return [];
    if (!ServiceLocator.questManager) return [];

    const npcBlueprintId = npc.id.split('#')[0];
    return ServiceLocator.questManager.getNpcQuestBriefs(executor as PlayerBase, npcBlueprintId);
  }

  /** 获取 NPC 的门派交互动作列表 */
  private getNpcSectActions(npc: NpcBase, executor?: LivingBase): string[] {
    if (!executor || !(executor instanceof PlayerBase)) return [];
    if (!ServiceLocator.sectManager) return [];
    return ServiceLocator.sectManager.getNpcAvailableActions(executor, npc);
  }

  /** 获取 NPC 的打工交互动作列表 */
  private getNpcWorkActions(npc: NpcBase, executor?: LivingBase): string[] {
    if (!executor || !(executor instanceof PlayerBase)) return [];
    if (!ServiceLocator.workManager) return [];
    return ServiceLocator.workManager.getNpcAvailableActions(executor, npc);
  }

  /** 客栈住店交互动作（简单 if/if） */
  private getNpcInnActions(npc: NpcBase): string[] {
    if (npc.get<boolean>('can_rent_room') === true) return ['rent'];
    return [];
  }

  /** 获取 NPC 可传授技能列表（用于前端只读技能面板） */
  private getNpcTeachSkills(npc: NpcBase): Array<{
    skillId: string;
    skillName: string;
    skillType: string;
    category: string;
    level: number;
    teachCost: number;
  }> {
    const teachSkillIds = npc.get<string[]>('teach_skills') ?? [];
    if (teachSkillIds.length === 0) return [];
    const teachSkillLevels = npc.get<Record<string, number>>('teach_skill_levels') ?? {};
    const teachCost = Math.max(0, Math.floor(npc.get<number>('teach_cost') ?? 10));

    return teachSkillIds.map((skillId) => {
      const skillDef = ServiceLocator.skillRegistry?.get(skillId);
      const rawLevel = teachSkillLevels[skillId];
      const level =
        typeof rawLevel === 'number' && Number.isFinite(rawLevel)
          ? Math.max(0, Math.floor(rawLevel))
          : 0;
      return {
        skillId,
        skillName: skillDef?.skillName ?? skillId,
        skillType: skillDef?.skillType ?? 'cognize',
        category: skillDef?.category ?? 'martial',
        level,
        teachCost,
      };
    });
  }

  /**
   * 学习技能按钮显示规则：
   * 1) 公共教习（can_public_teach=true）始终可学；
   * 2) 非公共教习时，仍沿用“仅当前师父可学”的门派判定。
   */
  private canLearnFromMaster(npc: NpcBase, executor?: LivingBase, hasTeachSkills = false): boolean {
    if (!hasTeachSkills) return false;
    if (!executor || !(executor instanceof PlayerBase)) return false;

    if (npc.get<boolean>('can_public_teach') === true) {
      return true;
    }

    const sectManager = ServiceLocator.sectManager;
    if (!sectManager) return false;

    const sectData = sectManager.getPlayerSectData(executor);
    if (!sectData.current) return false;

    const npcBlueprintId = npc.id.split('#')[0];
    if (sectData.current.masterNpcId !== npcBlueprintId) return false;

    return sectManager.isSameSectWithNpc(executor, npc);
  }
}
