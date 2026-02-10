/**
 * 嵩阳技能共享工具
 */
import type { SkillAction } from '../types';

export function createSongyangPlaceholderAction(name: string): SkillAction {
  return {
    name,
    description: `${name}（骨架占位，待后续任务补全动作细节）`,
    lvl: 1,
    costs: [{ resource: 'energy', amount: 8 }],
    modifiers: {
      attack: 0,
      damage: 0,
      dodge: 0,
      parry: 0,
      damageType: 'normal',
    },
  };
}
