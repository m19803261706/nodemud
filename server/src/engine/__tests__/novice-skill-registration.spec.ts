import { LivingBase } from '../game-objects/living-base';
import { registerNoviceSkills } from '../skills/novice/register-novice-skills';
import { NOVICE_SKILL_ID_LIST, NOVICE_SKILL_IDS } from '../skills/novice/novice-skill-ids';
import { SkillRegistry } from '../skills/skill-registry';

describe('Novice skill registration', () => {
  it('注册入口可一次性注册 4 门新手公共武学', () => {
    const registry = new SkillRegistry();
    const count = registerNoviceSkills(registry);

    expect(count).toBe(4);
    expect(registry.getCount()).toBe(4);
    expect(NOVICE_SKILL_ID_LIST).toHaveLength(4);
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

  it('学习门槛低于门派入门课，适配新手初期属性', () => {
    const registry = new SkillRegistry();
    registerNoviceSkills(registry);

    const rookie = new LivingBase('rookie#1');
    rookie.set('strength', 5);
    rookie.set('vitality', 5);
    rookie.set('perception', 5);
    rookie.set('spirit', 5);
    rookie.set('meridian', 5);

    expect(registry.get(NOVICE_SKILL_IDS.BASIC_BLADE)?.validLearn(rookie)).not.toBe(true);
    expect(registry.get(NOVICE_SKILL_IDS.BASIC_DODGE)?.validLearn(rookie)).not.toBe(true);
    expect(registry.get(NOVICE_SKILL_IDS.BASIC_PARRY)?.validLearn(rookie)).not.toBe(true);
    expect(registry.get(NOVICE_SKILL_IDS.BASIC_FORCE)?.validLearn(rookie)).not.toBe(true);

    rookie.set('strength', 6);
    rookie.set('vitality', 6);
    rookie.set('perception', 6);
    rookie.set('spirit', 6);
    rookie.set('meridian', 6);

    expect(registry.get(NOVICE_SKILL_IDS.BASIC_BLADE)?.validLearn(rookie)).toBe(true);
    expect(registry.get(NOVICE_SKILL_IDS.BASIC_DODGE)?.validLearn(rookie)).toBe(true);
    expect(registry.get(NOVICE_SKILL_IDS.BASIC_PARRY)?.validLearn(rookie)).toBe(true);
    expect(registry.get(NOVICE_SKILL_IDS.BASIC_FORCE)?.validLearn(rookie)).toBe(true);
  });
});
