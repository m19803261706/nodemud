import type { SkillAction } from '../types';
import { SpearSkillBase } from '../martial/weapon/spear-skill-base';
import { NOVICE_SKILL_IDS } from './novice-skill-ids';

const ACTIONS: SkillAction[] = [
  {
    name: '拦门一枪',
    description: '枪尖平出，直刺来人，先守门户再谈攻伐。',
    lvl: 1,
    costs: [{ resource: 'energy', amount: 5 }],
    modifiers: { attack: 7, damage: 5, dodge: 1, parry: 2, damageType: 'pierce' },
  },
  {
    name: '拨草寻蛇',
    description: '枪身横扫后疾刺，虚实难辨。',
    lvl: 20,
    costs: [{ resource: 'energy', amount: 7 }],
    modifiers: { attack: 11, damage: 8, dodge: 2, parry: 3, damageType: 'pierce' },
  },
  {
    name: '回马一枪',
    description: '佯退转身，借腰劲反刺，出其不意。',
    lvl: 45,
    costs: [{ resource: 'energy', amount: 9 }],
    modifiers: { attack: 15, damage: 12, dodge: 3, parry: 3, damageType: 'pierce' },
  },
  {
    name: '破阵连环',
    description: '连刺三枪如一枪，枪枪紧扣不留余地。',
    lvl: 70,
    costs: [{ resource: 'energy', amount: 11 }],
    modifiers: { attack: 19, damage: 16, dodge: 3, parry: 4, damageType: 'pierce' },
  },
];

export class NoviceBasicSpearSkill extends SpearSkillBase {
  get skillId(): string {
    return NOVICE_SKILL_IDS.BASIC_SPEAR;
  }

  get skillName(): string {
    return '江湖基础枪法';
  }

  validLearn(): true | string {
    return true;
  }

  get actions(): SkillAction[] {
    return ACTIONS;
  }

  getDescription(level: number): string {
    return `裂隙镇武馆的入门枪课，一寸长一寸强，讲究先手制人。\n当前境界：${Math.max(0, level)}。`;
  }
}
