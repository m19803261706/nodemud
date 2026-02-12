import type { SkillBase } from '../skill-base';
import type { SkillRegistry } from '../skill-registry';
import { NoviceBasicBladeSkill } from './novice-basic-blade.skill';
import { NoviceBasicDodgeSkill } from './novice-basic-dodge.skill';
import { NoviceBasicParrySkill } from './novice-basic-parry.skill';
import { NoviceBasicForceSkill } from './novice-basic-force.skill';

export function createNoviceSkills(): SkillBase[] {
  return [
    new NoviceBasicBladeSkill(),
    new NoviceBasicDodgeSkill(),
    new NoviceBasicParrySkill(),
    new NoviceBasicForceSkill(),
  ];
}

export function registerNoviceSkills(skillRegistry: SkillRegistry): number {
  const skills = createNoviceSkills();
  for (const skill of skills) {
    skillRegistry.register(skill);
  }
  return skills.length;
}
