import type { SkillAction } from '../types';
import { PalmSkillBase } from '../martial/unarmed/palm-skill-base';
import { NOVICE_SKILL_IDS } from './novice-skill-ids';

const ACTIONS: SkillAction[] = [
  {
    name: '推窗望月',
    description: '双掌前推，以柔劲送出，先稳架子再论力道。',
    lvl: 1,
    costs: [{ resource: 'energy', amount: 5 }],
    modifiers: { attack: 5, damage: 4, dodge: 3, parry: 2, damageType: 'blunt' },
  },
  {
    name: '穿云破雾',
    description: '侧身出掌，掌风斜切，取巧不取力。',
    lvl: 20,
    costs: [{ resource: 'energy', amount: 7 }],
    modifiers: { attack: 9, damage: 7, dodge: 4, parry: 3, damageType: 'blunt' },
  },
  {
    name: '拍浪回潮',
    description: '双掌交替拍出，一掌收一掌放，如潮起潮落。',
    lvl: 45,
    costs: [{ resource: 'energy', amount: 9 }],
    modifiers: { attack: 12, damage: 11, dodge: 5, parry: 4, damageType: 'blunt' },
  },
  {
    name: '碎碑裂石',
    description: '凝气于掌心，贯力一击，朴实却厚重。',
    lvl: 70,
    costs: [{ resource: 'energy', amount: 11 }],
    modifiers: { attack: 16, damage: 15, dodge: 5, parry: 5, damageType: 'blunt' },
  },
];

export class NoviceBasicPalmSkill extends PalmSkillBase {
  get skillId(): string {
    return NOVICE_SKILL_IDS.BASIC_PALM;
  }

  get skillName(): string {
    return '江湖基础掌法';
  }

  validLearn(): true | string {
    return true;
  }

  get actions(): SkillAction[] {
    return ACTIONS;
  }

  getDescription(level: number): string {
    return `裂隙镇武馆的入门掌课，以柔制刚，攻守兼备。\n当前境界：${Math.max(0, level)}。`;
  }
}
