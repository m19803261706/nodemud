import { LivingBase } from '../game-objects/living-base';
import { registerNoviceSkills } from '../skills/novice/register-novice-skills';
import { NOVICE_SKILL_ID_LIST, NOVICE_SKILL_IDS } from '../skills/novice/novice-skill-ids';
import { SkillRegistry } from '../skills/skill-registry';

describe('Novice skill registration', () => {
  it('注册入口可一次性注册 9 门新手公共武学', () => {
    const registry = new SkillRegistry();
    const count = registerNoviceSkills(registry);

    expect(count).toBe(9);
    expect(registry.getCount()).toBe(9);
    expect(NOVICE_SKILL_ID_LIST).toHaveLength(9);
  });

  it('公共武学默认不绑定门派', () => {
    const registry = new SkillRegistry();
    registerNoviceSkills(registry);

    for (const skillId of NOVICE_SKILL_ID_LIST) {
      const skill = registry.get(skillId);
      expect(skill).toBeDefined();
      expect(skill?.factionRequired).toBeNull();
    }
  });

  it('新手公共武学不设置属性门槛', () => {
    const registry = new SkillRegistry();
    registerNoviceSkills(registry);

    const rookie = new LivingBase('rookie#1');
    rookie.set('strength', 0);
    rookie.set('vitality', 0);
    rookie.set('perception', 0);
    rookie.set('spirit', 0);
    rookie.set('meridian', 0);

    expect(registry.get(NOVICE_SKILL_IDS.BASIC_BLADE)?.validLearn(rookie)).toBe(true);
    expect(registry.get(NOVICE_SKILL_IDS.BASIC_DODGE)?.validLearn(rookie)).toBe(true);
    expect(registry.get(NOVICE_SKILL_IDS.BASIC_PARRY)?.validLearn(rookie)).toBe(true);
    expect(registry.get(NOVICE_SKILL_IDS.BASIC_FORCE)?.validLearn(rookie)).toBe(true);
    expect(registry.get(NOVICE_SKILL_IDS.BASIC_SWORD)?.validLearn(rookie)).toBe(true);
    expect(registry.get(NOVICE_SKILL_IDS.BASIC_FIST)?.validLearn(rookie)).toBe(true);
    expect(registry.get(NOVICE_SKILL_IDS.BASIC_PALM)?.validLearn(rookie)).toBe(true);
    expect(registry.get(NOVICE_SKILL_IDS.BASIC_SPEAR)?.validLearn(rookie)).toBe(true);
    expect(registry.get(NOVICE_SKILL_IDS.BASIC_STAFF)?.validLearn(rookie)).toBe(true);
  });
});
