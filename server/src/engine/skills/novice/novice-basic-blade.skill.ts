import type { LivingBase } from '../../game-objects/living-base';
import type { SkillAction } from '../types';
import { BladeSkillBase } from '../martial/weapon/blade-skill-base';
import { NOVICE_SKILL_IDS } from './novice-skill-ids';

const ACTIONS: SkillAction[] = [
  {
    name: '挑帘起手',
    description: '刀身平抬，先护门面，再借腕力斜挑而进。',
    lvl: 1,
    costs: [{ resource: 'energy', amount: 5 }],
    modifiers: { attack: 6, damage: 5, dodge: 1, parry: 1, damageType: 'slash' },
  },
  {
    name: '横桥断势',
    description: '步随刀转，自腰间横斩，取“截势”二字。',
    lvl: 20,
    costs: [{ resource: 'energy', amount: 7 }],
    modifiers: { attack: 10, damage: 8, dodge: 2, parry: 2, damageType: 'slash' },
  },
  {
    name: '回锋压门',
    description: '一刀未尽即回锋压入，逼对手后撤换架。',
    lvl: 45,
    costs: [{ resource: 'energy', amount: 9 }],
    modifiers: { attack: 14, damage: 12, dodge: 3, parry: 3, damageType: 'slash' },
  },
  {
    name: '碎石落崖',
    description: '借步沉肘，刀势自上而下，重在劲道不断。',
    lvl: 70,
    costs: [{ resource: 'energy', amount: 11 }],
    modifiers: { attack: 18, damage: 16, dodge: 4, parry: 4, damageType: 'slash' },
  },
];

export class NoviceBasicBladeSkill extends BladeSkillBase {
  get skillId(): string {
    return NOVICE_SKILL_IDS.BASIC_BLADE;
  }

  get skillName(): string {
    return '江湖基础刀法';
  }

  validLearn(player: LivingBase): true | string {
    const strength = Math.max(0, Math.floor(player.get<number>('strength') ?? 0));
    if (strength < 6) {
      return '你筋骨尚浅，先在武馆扎稳马步，再来习刀。';
    }
    return true;
  }

  get actions(): SkillAction[] {
    return ACTIONS;
  }

  getDescription(level: number): string {
    return `裂隙镇武馆的启蒙刀课，讲究先稳后快，重在把出刀线路练直练稳。\n当前境界：${Math.max(0, level)}。`;
  }
}
