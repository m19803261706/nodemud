import type { SkillAction } from '../types';
import { StaffSkillBase } from '../martial/weapon/staff-skill-base';
import { NOVICE_SKILL_IDS } from './novice-skill-ids';

const ACTIONS: SkillAction[] = [
  {
    name: '横扫千军',
    description: '借棍身长势横扫，不求伤人，先求逼退。',
    lvl: 1,
    costs: [{ resource: 'energy', amount: 5 }],
    modifiers: { attack: 5, damage: 5, dodge: 1, parry: 4, damageType: 'blunt' },
  },
  {
    name: '劈山盖顶',
    description: '双手持棍高举劈下，重在气势与架稳。',
    lvl: 20,
    costs: [{ resource: 'energy', amount: 7 }],
    modifiers: { attack: 9, damage: 8, dodge: 2, parry: 5, damageType: 'blunt' },
    cooldown: 1,
  },
  {
    name: '拨云架挡',
    description: '棍身斜架，拨开来招，顺势反击。',
    lvl: 45,
    costs: [{ resource: 'energy', amount: 9 }],
    modifiers: { attack: 12, damage: 11, dodge: 3, parry: 7, damageType: 'blunt' },
    cooldown: 2,
  },
  {
    name: '旋风扫堂',
    description: '蹲身转体，棍扫脚踝，防不胜防。',
    lvl: 70,
    costs: [{ resource: 'energy', amount: 11 }],
    modifiers: { attack: 16, damage: 15, dodge: 4, parry: 7, damageType: 'blunt' },
    cooldown: 3,
  },
];

export class NoviceBasicStaffSkill extends StaffSkillBase {
  get skillId(): string {
    return NOVICE_SKILL_IDS.BASIC_STAFF;
  }

  get skillName(): string {
    return '江湖基础棍法';
  }

  validLearn(): true | string {
    return true;
  }

  get actions(): SkillAction[] {
    return ACTIONS;
  }

  getDescription(level: number): string {
    return `裂隙镇武馆的入门棍课，守多攻少，以招架见长。\n当前境界：${Math.max(0, level)}。`;
  }
}
