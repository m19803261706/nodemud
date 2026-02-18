import type { SkillAction } from '../types';
import { FistSkillBase } from '../martial/unarmed/fist-skill-base';
import { NOVICE_SKILL_IDS } from './novice-skill-ids';

const ACTIONS: SkillAction[] = [
  {
    name: '冲拳打面',
    description: '腰马合一，直拳快打，取"快"字诀。',
    lvl: 1,
    costs: [{ resource: 'energy', amount: 4 }],
    modifiers: { attack: 6, damage: 5, dodge: 2, parry: 1, damageType: 'blunt' },
  },
  {
    name: '连环崩拳',
    description: '左右交替出拳，步步紧逼，不给对手喘息。',
    lvl: 20,
    costs: [{ resource: 'energy', amount: 6 }],
    modifiers: { attack: 10, damage: 8, dodge: 3, parry: 2, damageType: 'blunt' },
    cooldown: 1,
  },
  {
    name: '撩阴冲膝',
    description: '虚拳引上，实膝顶下，声东击西。',
    lvl: 45,
    costs: [{ resource: 'energy', amount: 8 }],
    modifiers: { attack: 13, damage: 12, dodge: 4, parry: 3, damageType: 'blunt' },
    cooldown: 2,
  },
  {
    name: '劈山贯顶',
    description: '全身劲力贯于拳面，由上而下一击定胜负。',
    lvl: 70,
    costs: [{ resource: 'energy', amount: 10 }],
    modifiers: { attack: 17, damage: 16, dodge: 4, parry: 3, damageType: 'blunt' },
    cooldown: 3,
  },
];

export class NoviceBasicFistSkill extends FistSkillBase {
  get skillId(): string {
    return NOVICE_SKILL_IDS.BASIC_FIST;
  }

  get skillName(): string {
    return '江湖基础拳法';
  }

  validLearn(): true | string {
    return true;
  }

  get actions(): SkillAction[] {
    return ACTIONS;
  }

  getDescription(level: number): string {
    return `裂隙镇武馆的入门拳课，讲究拳快力沉，连打不断。\n当前境界：${Math.max(0, level)}。`;
  }
}
