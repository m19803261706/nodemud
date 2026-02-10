/**
 * 嵩阳技能注册入口
 */
import type { SkillBase } from '../skill-base';
import type { SkillRegistry } from '../skill-registry';
import { SongyangAdvancedBladeSkill } from './advanced/songyang-advanced-blade.skill';
import { SongyangAdvancedDodgeSkill } from './advanced/songyang-advanced-dodge.skill';
import { SongyangAdvancedForceSkill } from './advanced/songyang-advanced-force.skill';
import { SongyangAdvancedParrySkill } from './advanced/songyang-advanced-parry.skill';
import { SongyangGuardingEssenceSkill } from './canon/songyang-guarding-essence.skill';
import { SongyangEntryBladeSkill } from './entry/songyang-entry-blade.skill';
import { SongyangEntryDodgeSkill } from './entry/songyang-entry-dodge.skill';
import { SongyangEntryForceSkill } from './entry/songyang-entry-force.skill';
import { SongyangEntryParrySkill } from './entry/songyang-entry-parry.skill';
import { SongyangUltimateBladeSkill } from './ultimate/songyang-ultimate-blade.skill';
import { SongyangUltimateDodgeSkill } from './ultimate/songyang-ultimate-dodge.skill';
import { SongyangUltimateForceSkill } from './ultimate/songyang-ultimate-force.skill';
import { SongyangUltimateParrySkill } from './ultimate/songyang-ultimate-parry.skill';

export function createSongyangSkills(): SkillBase[] {
  return [
    new SongyangEntryBladeSkill(),
    new SongyangEntryDodgeSkill(),
    new SongyangEntryParrySkill(),
    new SongyangEntryForceSkill(),

    new SongyangAdvancedBladeSkill(),
    new SongyangAdvancedDodgeSkill(),
    new SongyangAdvancedParrySkill(),
    new SongyangAdvancedForceSkill(),

    new SongyangUltimateBladeSkill(),
    new SongyangUltimateDodgeSkill(),
    new SongyangUltimateParrySkill(),
    new SongyangUltimateForceSkill(),

    new SongyangGuardingEssenceSkill(),
  ];
}

export function registerSongyangSkills(skillRegistry: SkillRegistry): number {
  const skills = createSongyangSkills();
  for (const skill of skills) {
    skillRegistry.register(skill);
  }
  return skills.length;
}
