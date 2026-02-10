/**
 * examine 指令 -- 详细查看物品或 NPC
 *
 * 比 look 提供更详细的信息：武器攻击力、防具防御力、
 * 特殊标签（不可交易/不可丢弃/唯一）、可用操作列表等。
 *
 * 对标: LPC examine / 炎黄 id_cmd（鉴定）
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import { LivingBase } from '../../game-objects/living-base';
import { NpcBase } from '../../game-objects/npc-base';
import { ItemBase } from '../../game-objects/item-base';
import { ContainerBase } from '../../game-objects/container-base';
import { ArmorBase } from '../../game-objects/armor-base';
import { WeaponBase } from '../../game-objects/weapon-base';
import { rt, bold, ItemQuality, QUALITY_LABEL, getEquipmentTag } from '@packages/core';

/** 六维属性中文映射 */
const ATTR_CN: Record<string, string> = {
  wisdom: '慧根',
  perception: '心眼',
  spirit: '气海',
  meridian: '脉络',
  strength: '筋骨',
  vitality: '血气',
};

/** 装备槽位中文映射 */
const POSITION_LABEL: Record<string, string> = {
  head: '头部',
  body: '身体',
  hands: '手部',
  feet: '脚部',
  waist: '腰部',
  weapon: '主手',
  offhand: '副手',
  neck: '颈部',
  finger: '手指',
  wrist: '腕部',
};

/** 物品类型中文映射 */
const TYPE_LABEL: Record<string, string> = {
  weapon: '武器',
  armor: '防具',
  medicine: '药品',
  book: '秘籍',
  container: '容器',
  food: '食物',
  key: '钥匙',
  misc: '杂物',
};

@Command({
  name: 'examine',
  aliases: ['ex', '鉴定', '仔细看'],
  description: '详细查看物品或 NPC',
})
export class ExamineCommand implements ICommand {
  name = 'examine';
  aliases = ['ex', '鉴定', '仔细看'];
  description = '详细查看物品或 NPC';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    if (args.length === 0) {
      return { success: false, message: '查看什么？用法: examine <目标>' };
    }

    const env = executor.getEnvironment();
    if (!env) {
      return { success: false, message: '你不在任何地方。' };
    }

    const target = args.join(' ').trim();

    // 1. 背包物品
    const bagItem = executor
      .getInventory()
      .filter((e): e is ItemBase => e instanceof ItemBase)
      .find((i) => i.getName().includes(target));
    if (bagItem) return this.examineItem(bagItem);

    // 2. 房间 NPC
    const inventory = env.getInventory().filter((e) => e !== executor);
    const npc = inventory.find(
      (e) => e instanceof NpcBase && (e as NpcBase).getName().includes(target),
    );
    if (npc) return this.examineNpc(npc as NpcBase);

    // 3. 房间地面物品
    const groundItem = inventory
      .filter((e): e is ItemBase => e instanceof ItemBase)
      .find((i) => i.getName().includes(target));
    if (groundItem) return this.examineItem(groundItem);

    return { success: false, message: '这里没有这个东西。' };
  }

  /** 详细查看物品 */
  private examineItem(item: ItemBase): CommandResult {
    const name = item.getName();
    const long = item.getLong();
    const type = item.getType();
    const typeLabel = TYPE_LABEL[type] || type;
    const weight = item.getWeight();
    const value = item.getValue();
    const quality = item.getQuality();
    const wearPos = item.get<string>('wear_position') ?? '';
    const qualityTag = getEquipmentTag(wearPos, quality);

    const lines: string[] = [];
    lines.push(rt(qualityTag, bold(name)));
    lines.push(rt('rd', long));

    // 品质标签（凡品以上显示）
    if (quality > ItemQuality.COMMON) {
      lines.push(`品质: ${rt(qualityTag, QUALITY_LABEL[quality as ItemQuality] ?? '未知')}`);
    }

    lines.push(`类型: ${typeLabel}  重量: ${weight}  价值: ${value}`);

    // 武器：攻击力
    const damage = item.get<number>('damage');
    if (damage) {
      lines.push(`攻击: ${damage}`);
    }

    // 防具：防御力
    const defense = item.get<number>('defense');
    if (defense !== undefined && defense > 0) {
      lines.push(`防御: ${defense}`);
    }

    // 属性加成（武器/防具）
    if (item instanceof WeaponBase || item instanceof ArmorBase) {
      const bonus = item.getAttributeBonus();
      const bonusParts: string[] = [];
      // 六维属性
      if (bonus.attrs) {
        for (const [key, val] of Object.entries(bonus.attrs)) {
          if (val && val > 0) {
            bonusParts.push(`${ATTR_CN[key] || key}+${val}`);
          }
        }
      }
      // 三维资源
      if (bonus.resources) {
        if (bonus.resources.maxHp) bonusParts.push(`气血上限+${bonus.resources.maxHp}`);
        if (bonus.resources.maxMp) bonusParts.push(`内力上限+${bonus.resources.maxMp}`);
        if (bonus.resources.maxEnergy) bonusParts.push(`精力上限+${bonus.resources.maxEnergy}`);
      }
      if (bonusParts.length > 0) {
        lines.push(`属性加成: ${bonusParts.join(' ')}`);
      }
    }

    // 药品/食物：回复量
    const heal = item.get<number>('heal');
    if (heal !== undefined && heal > 0) {
      lines.push(`回复: ${heal}`);
    }

    // 装备部位
    if (wearPos) {
      lines.push(`部位: ${wearPos}`);
    }

    // 双手武器标记
    if (item instanceof WeaponBase && item.isTwoHanded()) {
      lines.push(rt('sys', '双手武器'));
    }

    // 等级需求
    const levelReq = item.getLevelReq();
    if (levelReq > 0) {
      lines.push(`需求等级: ${levelReq}`);
    }

    // 容器类物品：展示内容物详情
    if (item instanceof ContainerBase) {
      const contents = item.getContents();
      if (contents.length > 0) {
        lines.push('');
        lines.push('内容物:');
        for (const child of contents) {
          const childQuality = child.getQuality();
          const childWearPos = child.get<string>('wear_position') ?? '';
          const childTag = getEquipmentTag(childWearPos, childQuality);
          lines.push(
            `  ${rt(childTag, child.getName())} (${TYPE_LABEL[child.getType()] || child.getType()})`,
          );
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
          action: 'examine',
          target: 'container',
          containerId: item.id,
          containerName: name,
          isRemains,
          contents: item.getContentsBrief(),
        },
      };
    }

    // 特殊标签
    const tags: string[] = [];
    if (!item.isTradeable()) tags.push('不可交易');
    if (!item.isDroppable()) tags.push('不可丢弃');
    if (item.isUnique()) tags.push('唯一');
    if (tags.length > 0) {
      lines.push(rt('sys', tags.join(' | ')));
    }

    // 可用操作
    const actions = item.getActions();
    if (actions.length > 0) {
      lines.push(`可用操作: ${actions.join('、')}`);
    }

    return {
      success: true,
      message: lines.join('\n'),
      data: {
        action: 'examine',
        target: 'item',
        itemId: item.id,
        name,
        long,
        type,
        quality,
        weight,
        value,
        damage: damage || null,
        defense: defense ?? null,
        heal: heal ?? null,
        wearPosition: wearPos || null,
        tradeable: item.isTradeable(),
        droppable: item.isDroppable(),
        unique: item.isUnique(),
        actions,
      },
    };
  }

  /** 详细查看 NPC */
  private examineNpc(npc: NpcBase): CommandResult {
    const name = npc.getName();
    const title = npc.get<string>('title') || '';
    const long = npc.getLong();
    const gender = npc.get<string>('gender') === 'male' ? '男' : '女';
    const level = npc.get<number>('level') || 1;
    const attitude = npc.get<string>('attitude') || 'neutral';
    const faction = npc.get<string>('visible_faction') || '';
    const hp = npc.get<number>('hp') || 0;
    const maxHp = npc.get<number>('max_hp') || 1;
    const hpPct = Math.round((hp / maxHp) * 100);

    const header = title ? `${title}·${name}` : name;
    const lines: string[] = [];
    lines.push(rt('rn', bold(header)));
    lines.push(title ? `「${title}」${name} [${gender}]` : `${name} [${gender}]`);
    if (faction) lines.push(`势力: ${faction}`);
    lines.push(`等级: Lv.${level}  生命: ${hpPct}%`);
    lines.push(rt('rd', long));

    // NPC 装备展示
    const equipment = npc.getEquipment();
    const eqLines: string[] = [];
    const seen = new Set<string>();
    for (const [pos, item] of equipment) {
      if (!item || seen.has(item.id)) continue;
      seen.add(item.id);
      const quality = item.getQuality();
      const eqWearPos = item.get<string>('wear_position') ?? pos;
      const tag = getEquipmentTag(eqWearPos, quality);
      const label = POSITION_LABEL[pos] || pos;
      eqLines.push(`  ${label}: ${rt(tag, item.getName())}`);
    }
    if (eqLines.length > 0) {
      lines.push('装备:');
      eqLines.forEach((l) => lines.push(l));
    }

    return {
      success: true,
      message: lines.join('\n'),
      data: {
        action: 'examine',
        target: 'npc',
        npcId: npc.id,
        name,
        title,
        gender: npc.get<string>('gender') || 'male',
        faction,
        level,
        hpPct,
        attitude,
        short: npc.getShort(),
        long,
      },
    };
  }
}
