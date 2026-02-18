import type { SkillAction } from '../types';
import { SwordSkillBase } from '../martial/weapon/sword-skill-base';
import { NOVICE_SKILL_IDS } from './novice-skill-ids';

const ACTIONS: SkillAction[] = [
  {
    name: '引锋试探',
    description: '剑尖微引，以轻刺试敌虚实，不求伤人，先求看清。',
    lvl: 1,
    costs: [{ resource: 'energy', amount: 5 }],
    modifiers: { attack: 7, damage: 4, dodge: 2, parry: 2, damageType: 'pierce' },
  },
  {
    name: '斜飞拦腰',
    description: '身随剑走，从侧面划出一道弧线，逼对手收招换步。',
    lvl: 20,
    costs: [{ resource: 'energy', amount: 7 }],
    modifiers: { attack: 11, damage: 7, dodge: 3, parry: 3, damageType: 'slash' },
  },
  {
    name: '提剑封门',
    description: '竖剑于胸前，以守待攻，伺机反刺。',
    lvl: 45,
    costs: [{ resource: 'energy', amount: 9 }],
    modifiers: { attack: 14, damage: 11, dodge: 4, parry: 5, damageType: 'pierce' },
  },
  {
    name: '坠星一击',
    description: '纵身前跃，借落势将剑劲压到最重的一刺。',
    lvl: 70,
    costs: [{ resource: 'energy', amount: 11 }],
    modifiers: { attack: 18, damage: 15, dodge: 4, parry: 4, damageType: 'pierce' },
  },
];

export class NoviceBasicSwordSkill extends SwordSkillBase {
  get skillId(): string {
    return NOVICE_SKILL_IDS.BASIC_SWORD;
  }

  get skillName(): string {
    return '江湖基础剑法';
  }

  validLearn(): true | string {
    return true;
  }

  get actions(): SkillAction[] {
    return ACTIONS;
  }

  getDescription(level: number): string {
    return `裂隙镇武馆的入门剑课，讲究先稳后准，以守带攻。\n当前境界：${Math.max(0, level)}。`;
  }
}
