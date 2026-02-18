import type { CharacterAttrs, SkillAction } from '../types';
import { QiInternalBase } from '../internal/qi-internal-base';
import { NOVICE_SKILL_IDS } from './novice-skill-ids';

const ACTIONS: SkillAction[] = [
  {
    name: '静息归元',
    description: '沉肩落肘，先稳呼吸，再缓缓归气入腹。',
    lvl: 1,
    costs: [{ resource: 'mp', amount: 7 }],
    modifiers: { attack: 5, damage: 5, dodge: 4, parry: 4, damageType: 'internal' },
  },
  {
    name: '引气循脉',
    description: '以内息沿脉缓行，先求不断，再求顺畅。',
    lvl: 25,
    costs: [{ resource: 'mp', amount: 10 }],
    modifiers: { attack: 8, damage: 8, dodge: 5, parry: 5, damageType: 'internal' },
    cooldown: 1,
  },
  {
    name: '收束丹田',
    description: '收束散气于气海，出手时内劲较先前凝练。',
    lvl: 55,
    costs: [{ resource: 'mp', amount: 13 }],
    modifiers: { attack: 11, damage: 12, dodge: 6, parry: 6, damageType: 'internal' },
    cooldown: 2,
  },
  {
    name: '通络凝神',
    description: '吐纳与心念同频，行气不急不躁，绵而不断。',
    lvl: 85,
    costs: [{ resource: 'mp', amount: 16 }],
    modifiers: { attack: 14, damage: 16, dodge: 8, parry: 8, damageType: 'internal' },
    cooldown: 3,
  },
];

export class NoviceBasicForceSkill extends QiInternalBase {
  get skillId(): string {
    return NOVICE_SKILL_IDS.BASIC_FORCE;
  }

  get skillName(): string {
    return '引气诀';
  }

  validLearn(): true | string {
    return true;
  }

  get actions(): SkillAction[] {
    return ACTIONS;
  }

  getDescription(level: number): string {
    return `书院传授的入门吐纳法，先养息，再行气，重在打底。\n当前境界：${Math.max(0, level)}。`;
  }

  getAttributeBonus(level: number): Partial<CharacterAttrs> {
    return {
      spirit: Math.floor(level / 30),
      meridian: Math.floor(level / 40),
    };
  }

  getResourceBonus(level: number): { maxHp?: number; maxMp?: number } {
    return {
      maxMp: level,
    };
  }
}
