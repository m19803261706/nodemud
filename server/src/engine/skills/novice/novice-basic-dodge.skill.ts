import type { LivingBase } from '../../game-objects/living-base';
import type { SkillAction } from '../types';
import { DodgeSkillBase } from '../martial/dodge-skill-base';
import { NOVICE_SKILL_IDS } from './novice-skill-ids';

const ACTIONS: SkillAction[] = [
  {
    name: '碎步借位',
    description: '脚掌细碎换位，不与来势正撞。',
    lvl: 1,
    costs: [{ resource: 'energy', amount: 5 }],
    modifiers: { attack: 4, damage: 3, dodge: 10, parry: 6, damageType: 'blunt' },
  },
  {
    name: '侧身穿隙',
    description: '看准来路，侧腰贴身而过，余势不断。',
    lvl: 20,
    costs: [{ resource: 'energy', amount: 7 }],
    modifiers: { attack: 6, damage: 5, dodge: 15, parry: 8, damageType: 'blunt' },
  },
  {
    name: '回环抢线',
    description: '先避后切，借半步回环抢回中线。',
    lvl: 45,
    costs: [{ resource: 'energy', amount: 9 }],
    modifiers: { attack: 9, damage: 7, dodge: 20, parry: 10, damageType: 'blunt' },
  },
  {
    name: '踏影折返',
    description: '落足轻，换位快，身影似在原地又似已离位。',
    lvl: 70,
    costs: [{ resource: 'energy', amount: 11 }],
    modifiers: { attack: 12, damage: 10, dodge: 25, parry: 12, damageType: 'blunt' },
  },
];

export class NoviceBasicDodgeSkill extends DodgeSkillBase {
  get skillId(): string {
    return NOVICE_SKILL_IDS.BASIC_DODGE;
  }

  get skillName(): string {
    return '行旅身法';
  }

  validLearn(player: LivingBase): true | string {
    const perception = Math.max(0, Math.floor(player.get<number>('perception') ?? 0));
    if (perception < 6) {
      return '你眼力火候未到，先练脚下方位与呼吸节奏。';
    }
    return true;
  }

  get actions(): SkillAction[] {
    return ACTIONS;
  }

  getDescription(level: number): string {
    return `行商护队常用的轻身步法，重在识路、借位与保命，不走花巧路线。\n当前境界：${Math.max(0, level)}。`;
  }
}
