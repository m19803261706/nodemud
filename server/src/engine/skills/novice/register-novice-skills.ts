import type { SkillBase } from '../skill-base';
import type { SkillRegistry } from '../skill-registry';
import { NoviceBasicBladeSkill } from './novice-basic-blade.skill';
import { NoviceBasicDodgeSkill } from './novice-basic-dodge.skill';
import { NoviceBasicParrySkill } from './novice-basic-parry.skill';
import { NoviceBasicForceSkill } from './novice-basic-force.skill';
import { NoviceBasicSwordSkill } from './novice-basic-sword.skill';
import { NoviceBasicFistSkill } from './novice-basic-fist.skill';
import { NoviceBasicPalmSkill } from './novice-basic-palm.skill';
import { NoviceBasicSpearSkill } from './novice-basic-spear.skill';
import { NoviceBasicStaffSkill } from './novice-basic-staff.skill';

export function createNoviceSkills(): SkillBase[] {
  return [
    new NoviceBasicBladeSkill(),
    new NoviceBasicDodgeSkill(),
    new NoviceBasicParrySkill(),
    new NoviceBasicForceSkill(),
    new NoviceBasicSwordSkill(),
    new NoviceBasicFistSkill(),
    new NoviceBasicPalmSkill(),
    new NoviceBasicSpearSkill(),
    new NoviceBasicStaffSkill(),
  ];
}

export function registerNoviceSkills(skillRegistry: SkillRegistry): number {
  const skills = createNoviceSkills();
  for (const skill of skills) {
    skillRegistry.register(skill);
  }
  return skills.length;
}
