import { SkillTier, SONGYANG_FACTION_ID, SONGYANG_SKILL_META, getSongyangSkillMeta } from '../skills/songyang/songyang-skill-meta';
import { SONGYANG_SKILL_ID_LIST } from '../skills/songyang/songyang-skill-ids';
import { registerSongyangSkills } from '../skills/songyang/register-songyang-skills';
import { SkillRegistry } from '../skills/skill-registry';

describe('Songyang skill registration', () => {
  it('注册入口可一次性注册 13 门嵩阳技能', () => {
    const registry = new SkillRegistry();
    const count = registerSongyangSkills(registry);

    expect(count).toBe(13);
    expect(registry.getCount()).toBe(13);
    expect(SONGYANG_SKILL_ID_LIST).toHaveLength(13);
  });

  it('元数据与技能定义保持同源且唯一', () => {
    const registry = new SkillRegistry();
    registerSongyangSkills(registry);

    const names = new Set<string>();
    const ids = new Set<string>();

    for (const skillId of SONGYANG_SKILL_ID_LIST) {
      const runtimeSkill = registry.get(skillId);
      const meta = getSongyangSkillMeta(skillId);

      expect(runtimeSkill).toBeDefined();
      expect(runtimeSkill?.skillId).toBe(meta.skillId);
      expect(runtimeSkill?.skillName).toBe(meta.skillName);
      expect(runtimeSkill?.skillType).toBe(meta.slot);
      expect(runtimeSkill?.factionRequired).toBe(meta.factionRequired);

      names.add(meta.skillName);
      ids.add(meta.skillId);
    }

    expect(names.size).toBe(13);
    expect(ids.size).toBe(13);

    const tiers = new Set(Object.values(SONGYANG_SKILL_META).map((meta) => meta.tier));
    expect([...tiers].sort()).toEqual([
      SkillTier.ADVANCED,
      SkillTier.CANON,
      SkillTier.ENTRY,
      SkillTier.ULTIMATE,
    ]);
    expect(Object.values(SONGYANG_SKILL_META).every((meta) => meta.factionRequired === SONGYANG_FACTION_ID)).toBe(true);
  });
});
