import type { SkillAction } from '../types';
import { ParrySkillBase } from '../martial/parry-skill-base';
import { NOVICE_SKILL_IDS } from './novice-skill-ids';

const ACTIONS: SkillAction[] = [
  {
    name: '抬肘护心',
    description: '手臂抬肘护中，先护心口再寻回手机会。',
    lvl: 1,
    costs: [{ resource: 'energy', amount: 5 }],
    modifiers: { attack: 5, damage: 4, dodge: 5, parry: 12, damageType: 'blunt' },
  },
  {
    name: '斜封卸力',
    description: '斜向封来势，把冲劲卸向肩外。',
    lvl: 20,
    costs: [{ resource: 'energy', amount: 7 }],
    modifiers: { attack: 8, damage: 6, dodge: 7, parry: 17, damageType: 'blunt' },
    cooldown: 1,
  },
  {
    name: '并掌截门',
    description: '双臂并门，先截来路，再借身位反顶。',
    lvl: 45,
    costs: [{ resource: 'energy', amount: 9 }],
    modifiers: { attack: 11, damage: 9, dodge: 9, parry: 22, damageType: 'blunt' },
    cooldown: 2,
  },
  {
    name: '守拙反震',
    description: '守而不僵，借对手力道反震其架。',
    lvl: 70,
    costs: [{ resource: 'energy', amount: 11 }],
    modifiers: { attack: 14, damage: 12, dodge: 11, parry: 28, damageType: 'blunt' },
    cooldown: 3,
  },
];

export class NoviceBasicParrySkill extends ParrySkillBase {
  get skillId(): string {
    return NOVICE_SKILL_IDS.BASIC_PARRY;
  }

  get skillName(): string {
    return '守拙架';
  }

  validLearn(): true | string {
    return true;
  }

  get actions(): SkillAction[] {
    return ACTIONS;
  }

  getDescription(level: number): string {
    return `裂隙镇护队常练的守势架法，不求花哨，重在“站得住、扛得住”。\n当前境界：${Math.max(0, level)}。`;
  }
}
