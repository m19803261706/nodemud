/**
 * 嵩阳技能动作池与描述生成工具
 */
import type { ResourceCost, SkillAction } from '../types';
import type { SongyangSkillId } from './songyang-skill-ids';
import { SONGYANG_SKILL_IDS } from './songyang-skill-ids';
import { getSongyangSkillMeta } from './songyang-skill-meta';
import { describeSongyangUnlockRules } from './songyang-unlock-evaluator';

interface SongyangSkillContent {
  background: string;
  formula: string;
  extension: string;
  actions: SkillAction[];
}

function action(
  name: string,
  lvl: number,
  costs: ResourceCost[],
  modifiers: SkillAction['modifiers'],
  description?: string,
): SkillAction {
  return {
    name,
    description: description ?? `${name}，借嵩阳门中章法稳步推进。`,
    lvl,
    costs,
    modifiers,
  };
}

const SONGYANG_SKILL_CONTENT: Record<SongyangSkillId, SongyangSkillContent> = {
  [SONGYANG_SKILL_IDS.ENTRY_BLADE]: {
    background: '嵩阳弟子初入门墙所修刀课，以“稳、正、准”立身，先校步，再出刃。',
    formula:
      '招式按现有 DamageEngine 结算：effectiveAttack = getAttack + attack修正；baseDamage = effectiveAttack * random(0.8~1.2)；最终伤害按攻防分段后再叠加 damage 修正；武器不匹配时乘 0.6。',
    extension: '后续可在 extensionHooks 中接入“山门考课”表现加成与刀势连段。',
    actions: [
      action('山门起刀', 1, [{ resource: 'energy', amount: 6 }], {
        attack: 8,
        damage: 6,
        dodge: 1,
        parry: 1,
        damageType: 'slash',
      }),
      action('松峦横斩', 30, [{ resource: 'energy', amount: 8 }], {
        attack: 14,
        damage: 12,
        dodge: 2,
        parry: 2,
        damageType: 'slash',
      }),
      action('碑前断势', 60, [{ resource: 'energy', amount: 10 }], {
        attack: 20,
        damage: 18,
        dodge: 3,
        parry: 3,
        damageType: 'slash',
      }),
      action('中岳劈空', 90, [{ resource: 'energy', amount: 12 }], {
        attack: 28,
        damage: 24,
        dodge: 4,
        parry: 4,
        damageType: 'slash',
      }),
    ],
  },
  [SONGYANG_SKILL_IDS.ENTRY_DODGE]: {
    background: '松峙步取法山道松影，讲究重心先稳后移，步法用于战中脱线与回位。',
    formula:
      '战斗中仍走 DamageEngine；本技能招式以低伤害+较高 dodge/parry 修正为主，当前主要通过 action modifiers 进入战斗链，命中/减伤细分判定保留后续扩展。',
    extension: '后续可追加“山道地形记忆”钩子，但本期不引入地形差机制。',
    actions: [
      action('松影挪步', 1, [{ resource: 'energy', amount: 5 }], {
        attack: 4,
        damage: 3,
        dodge: 12,
        parry: 6,
        damageType: 'blunt',
      }),
      action('回身踏石', 30, [{ resource: 'energy', amount: 7 }], {
        attack: 7,
        damage: 5,
        dodge: 18,
        parry: 9,
        damageType: 'blunt',
      }),
      action('并峰换位', 60, [{ resource: 'energy', amount: 9 }], {
        attack: 10,
        damage: 8,
        dodge: 24,
        parry: 12,
        damageType: 'blunt',
      }),
      action('云栈回旋', 90, [{ resource: 'energy', amount: 11 }], {
        attack: 14,
        damage: 10,
        dodge: 30,
        parry: 15,
        damageType: 'blunt',
      }),
    ],
  },
  [SONGYANG_SKILL_IDS.ENTRY_PARRY]: {
    background: '守正架重在“先守后发”，以肩肘成线护中宫，入门弟子据此磨练基本对拆。',
    formula:
      '仍按 DamageEngine 计算基础伤害；本技能在招式中预埋较高 parry 修正与中等 attack 修正，保持“守中带打”的门派风格。',
    extension: '后续可与执法线任务挂钩，叠加“守势不乱”触发条目。',
    actions: [
      action('守中格架', 1, [{ resource: 'energy', amount: 5 }], {
        attack: 6,
        damage: 4,
        dodge: 6,
        parry: 14,
        damageType: 'blunt',
      }),
      action('斜封回震', 30, [{ resource: 'energy', amount: 7 }], {
        attack: 10,
        damage: 7,
        dodge: 8,
        parry: 20,
        damageType: 'blunt',
      }),
      action('镇门截势', 60, [{ resource: 'energy', amount: 9 }], {
        attack: 14,
        damage: 10,
        dodge: 10,
        parry: 26,
        damageType: 'blunt',
      }),
      action('抱岳卸锋', 90, [{ resource: 'energy', amount: 11 }], {
        attack: 18,
        damage: 14,
        dodge: 12,
        parry: 32,
        damageType: 'blunt',
      }),
    ],
  },
  [SONGYANG_SKILL_IDS.ENTRY_FORCE]: {
    background: '吐纳诀为嵩阳内息启蒙，以平稳呼吸调匀气海，奠定后续内功根基。',
    formula:
      '内功招式同样走 DamageEngine，attack/damage 修正写入 action.modifiers；资源加成由 InternalSkillBase.getResourceBonus 生效，activeForce 激活后叠加 maxMp。',
    extension: '后续可扩展打坐分支与运功特效，不改现有协议。',
    actions: [
      action('吐纳回环', 1, [{ resource: 'mp', amount: 8 }], {
        attack: 5,
        damage: 5,
        dodge: 4,
        parry: 4,
        damageType: 'internal',
      }),
      action('归息沉丹', 40, [{ resource: 'mp', amount: 12 }], {
        attack: 9,
        damage: 9,
        dodge: 6,
        parry: 6,
        damageType: 'internal',
      }),
      action('岚谷行气', 80, [{ resource: 'mp', amount: 16 }], {
        attack: 13,
        damage: 14,
        dodge: 8,
        parry: 8,
        damageType: 'internal',
      }),
      action('百脉齐鸣', 120, [{ resource: 'mp', amount: 20 }], {
        attack: 18,
        damage: 20,
        dodge: 10,
        parry: 10,
        damageType: 'internal',
      }),
    ],
  },
  [SONGYANG_SKILL_IDS.ADVANCED_BLADE]: {
    background: '断岳刀重在破势，讲究以短促爆发切入敌方节奏，再用连斩压住回手空间。',
    formula:
      '在 DamageEngine 基础上提高 attack/damage 修正，偏重“攻>=防”区间收益；武器不匹配惩罚仍严格乘 0.6，不额外放宽。',
    extension: '后续可接入“断岳三试”挑战钩子，解锁额外动作。',
    actions: [
      action('断岳斜劈', 1, [{ resource: 'energy', amount: 9 }], {
        attack: 16,
        damage: 14,
        dodge: 2,
        parry: 2,
        damageType: 'slash',
      }),
      action('回刃封喉', 50, [{ resource: 'energy', amount: 12 }], {
        attack: 24,
        damage: 22,
        dodge: 3,
        parry: 3,
        damageType: 'slash',
      }),
      action('崖线追压', 100, [{ resource: 'energy', amount: 15 }], {
        attack: 32,
        damage: 30,
        dodge: 4,
        parry: 4,
        damageType: 'slash',
      }),
      action('断峰沉雷', 150, [{ resource: 'energy', amount: 18 }], {
        attack: 40,
        damage: 38,
        dodge: 5,
        parry: 5,
        damageType: 'slash',
      }),
    ],
  },
  [SONGYANG_SKILL_IDS.ADVANCED_DODGE]: {
    background: '登嵩身法由山路攀行而来，强调连续变向与高低步切换。',
    formula:
      '维持 DamageEngine 主链，本技能主要提供更高 dodge/parry 修正并保持低耗能，适合在 ATB 回合中频繁调用。',
    extension: '后续可按演武连胜结果开放“步影叠层”被动。',
    actions: [
      action('登阶换影', 1, [{ resource: 'energy', amount: 8 }], {
        attack: 8,
        damage: 6,
        dodge: 20,
        parry: 10,
        damageType: 'blunt',
      }),
      action('峦脊掠身', 50, [{ resource: 'energy', amount: 10 }], {
        attack: 12,
        damage: 9,
        dodge: 27,
        parry: 13,
        damageType: 'blunt',
      }),
      action('双岫回踏', 100, [{ resource: 'energy', amount: 12 }], {
        attack: 16,
        damage: 12,
        dodge: 34,
        parry: 16,
        damageType: 'blunt',
      }),
      action('绝壁九折', 150, [{ resource: 'energy', amount: 14 }], {
        attack: 20,
        damage: 16,
        dodge: 42,
        parry: 20,
        damageType: 'blunt',
      }),
    ],
  },
  [SONGYANG_SKILL_IDS.ADVANCED_PARRY]: {
    background: '镇关架由守山值守实战演化而来，专攻“抢中线、断来路”。',
    formula:
      'DamageEngine 不变；通过提高 parry 与适度 attack 修正，在对拼中压低对手有效收益，仍不引入地形或额外随机轴。',
    extension: '后续可结合执法长老线加入“关前问责”额外触发。',
    actions: [
      action('镇关横封', 1, [{ resource: 'energy', amount: 8 }], {
        attack: 12,
        damage: 8,
        dodge: 10,
        parry: 24,
        damageType: 'blunt',
      }),
      action('并手压脊', 50, [{ resource: 'energy', amount: 10 }], {
        attack: 16,
        damage: 12,
        dodge: 12,
        parry: 30,
        damageType: 'blunt',
      }),
      action('断桥锁门', 100, [{ resource: 'energy', amount: 12 }], {
        attack: 20,
        damage: 15,
        dodge: 14,
        parry: 36,
        damageType: 'blunt',
      }),
      action('万钧镇岳', 150, [{ resource: 'energy', amount: 14 }], {
        attack: 24,
        damage: 20,
        dodge: 16,
        parry: 44,
        damageType: 'blunt',
      }),
    ],
  },
  [SONGYANG_SKILL_IDS.ADVANCED_FORCE]: {
    background: '中岳归元功以“归、敛、聚、发”为序，重塑内息流转效率。',
    formula:
      'activeForce 时 ResourceBonus 按等级抬升 maxMp；招式命中后仍遵循 DamageEngine，action.damage 修正用于体现内劲层次。',
    extension: '后续可接运功体系，实现护体与短时提气分支。',
    actions: [
      action('归元纳气', 1, [{ resource: 'mp', amount: 14 }], {
        attack: 10,
        damage: 12,
        dodge: 8,
        parry: 8,
        damageType: 'internal',
      }),
      action('中盘转息', 60, [{ resource: 'mp', amount: 18 }], {
        attack: 15,
        damage: 18,
        dodge: 10,
        parry: 10,
        damageType: 'internal',
      }),
      action('岳势同流', 120, [{ resource: 'mp', amount: 22 }], {
        attack: 20,
        damage: 25,
        dodge: 12,
        parry: 12,
        damageType: 'internal',
      }),
      action('归一震脉', 180, [{ resource: 'mp', amount: 26 }], {
        attack: 26,
        damage: 32,
        dodge: 14,
        parry: 14,
        damageType: 'internal',
      }),
    ],
  },
  [SONGYANG_SKILL_IDS.ULTIMATE_BLADE]: {
    background: '天柱问岳刀为门中终阶刀路，刀意指向“问心与问势并行”。',
    formula:
      '沿用 DamageEngine，重点放大 attack/damage 修正并提高资源消耗；在攻强场景下可快速拉开伤害差距，仍受武器匹配限制。',
    extension: '后续可引入掌门试刀节点，解锁特定演武动作。',
    actions: [
      action('天柱问势', 1, [{ resource: 'energy', amount: 14 }, { resource: 'mp', amount: 10 }], {
        attack: 30,
        damage: 28,
        dodge: 4,
        parry: 4,
        damageType: 'slash',
      }),
      action('岳门裂空', 70, [{ resource: 'energy', amount: 17 }, { resource: 'mp', amount: 14 }], {
        attack: 40,
        damage: 38,
        dodge: 5,
        parry: 5,
        damageType: 'slash',
      }),
      action('嵩巅坠刃', 140, [{ resource: 'energy', amount: 20 }, { resource: 'mp', amount: 18 }], {
        attack: 52,
        damage: 48,
        dodge: 6,
        parry: 6,
        damageType: 'slash',
      }),
      action('问岳无回', 210, [{ resource: 'energy', amount: 24 }, { resource: 'mp', amount: 22 }], {
        attack: 64,
        damage: 60,
        dodge: 7,
        parry: 7,
        damageType: 'slash',
      }),
    ],
  },
  [SONGYANG_SKILL_IDS.ULTIMATE_DODGE]: {
    background: '云梯九转取“九折不乱”之意，在极端节奏中保持步位与反击窗口。',
    formula:
      '核心是高 dodge/parry 修正与可控资源消耗；伤害主链仍由 DamageEngine 计算，不新增额外命中公式。',
    extension: '后续可接“九转试步”玩法，扩展回合内位移叙事。',
    actions: [
      action('云梯回身', 1, [{ resource: 'energy', amount: 12 }], {
        attack: 14,
        damage: 10,
        dodge: 36,
        parry: 18,
        damageType: 'blunt',
      }),
      action('折岭连换', 70, [{ resource: 'energy', amount: 14 }], {
        attack: 18,
        damage: 14,
        dodge: 44,
        parry: 22,
        damageType: 'blunt',
      }),
      action('栈道穿云', 140, [{ resource: 'energy', amount: 16 }], {
        attack: 22,
        damage: 18,
        dodge: 52,
        parry: 26,
        damageType: 'blunt',
      }),
      action('九转归岚', 210, [{ resource: 'energy', amount: 18 }], {
        attack: 26,
        damage: 22,
        dodge: 60,
        parry: 30,
        damageType: 'blunt',
      }),
    ],
  },
  [SONGYANG_SKILL_IDS.ULTIMATE_PARRY]: {
    background: '不动关山架为终阶守势，强调“守得住，方有资格谈反击”。',
    formula:
      '以高 parry 修正驱动“硬接后反震”风格，伤害仍由 DamageEngine 主链决定，本期仅预埋命中/减伤细化所需修正项。',
    extension: '后续可追加“守关”型任务连动，记录连续无伤回合。',
    actions: [
      action('关山不移', 1, [{ resource: 'energy', amount: 12 }], {
        attack: 20,
        damage: 14,
        dodge: 18,
        parry: 40,
        damageType: 'blunt',
      }),
      action('铁壁回澜', 70, [{ resource: 'energy', amount: 14 }], {
        attack: 24,
        damage: 18,
        dodge: 20,
        parry: 48,
        damageType: 'blunt',
      }),
      action('镇岭截岳', 140, [{ resource: 'energy', amount: 16 }], {
        attack: 28,
        damage: 22,
        dodge: 22,
        parry: 56,
        damageType: 'blunt',
      }),
      action('不动千山', 210, [{ resource: 'energy', amount: 18 }], {
        attack: 34,
        damage: 28,
        dodge: 24,
        parry: 64,
        damageType: 'blunt',
      }),
    ],
  },
  [SONGYANG_SKILL_IDS.ULTIMATE_FORCE]: {
    background: '乾元一气功主张内外一线，追求“气足则势成，势成则法明”。',
    formula:
      '内功招式直接叠加较高 attack/damage 修正并消耗 mp；ResourceBonus 提高 maxMp，战中表现与 DamageEngine 保持同源。',
    extension: '后续可接“乾元试演”与门派共鸣被动，不改变现有消息协议。',
    actions: [
      action('乾元引气', 1, [{ resource: 'mp', amount: 20 }], {
        attack: 18,
        damage: 24,
        dodge: 12,
        parry: 12,
        damageType: 'internal',
      }),
      action('一线冲脉', 80, [{ resource: 'mp', amount: 24 }], {
        attack: 24,
        damage: 32,
        dodge: 14,
        parry: 14,
        damageType: 'internal',
      }),
      action('元炁合流', 160, [{ resource: 'mp', amount: 28 }], {
        attack: 30,
        damage: 40,
        dodge: 16,
        parry: 16,
        damageType: 'internal',
      }),
      action('一气贯岳', 240, [{ resource: 'mp', amount: 32 }], {
        attack: 38,
        damage: 50,
        dodge: 18,
        parry: 18,
        damageType: 'internal',
      }),
    ],
  },
  [SONGYANG_SKILL_IDS.CANON_ESSENCE]: {
    background: '嵩阳守正真意为镇派总纲，不偏兵刃，不偏内外，重在统摄诸法与心志。',
    formula:
      '本技能为 COGNIZE 类型，不直接参与 DamageEngine 招式结算；当前通过学习判定与后续残缺态逻辑影响成长链路。',
    extension: '后续可承接叛门残缺保留、20% 传承效率与专属剧情钩子。',
    actions: [],
  },
};

export function getSongyangSkillActions(skillId: SongyangSkillId): SkillAction[] {
  return SONGYANG_SKILL_CONTENT[skillId].actions;
}

export function buildSongyangSkillDescription(skillId: SongyangSkillId, level: number): string {
  const meta = getSongyangSkillMeta(skillId);
  const content = SONGYANG_SKILL_CONTENT[skillId];
  const unlockLines = describeSongyangUnlockRules(skillId);
  const actionPreview =
    content.actions.length > 0
      ? `当前可见动作池 ${content.actions.length} 式（随等级逐段解锁）。`
      : '此技能不提供直接招式，定位为总纲与成长控制。';

  return [
    `【背景】${content.background}`,
    `【学习条件】${unlockLines.join(' ')} 当前技能层级：${meta.tier}。`,
    `【战斗公式】${content.formula} ${actionPreview} 当前等级：${level}。`,
    `【扩展】${content.extension}`,
  ].join('\n');
}
