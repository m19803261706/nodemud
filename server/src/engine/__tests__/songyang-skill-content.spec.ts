import { SkillCategory, SkillSlotType } from '@packages/core';
import { SkillRegistry } from '../skills/skill-registry';
import { registerSongyangSkills } from '../skills/songyang/register-songyang-skills';
import { SONGYANG_SKILL_IDS, SONGYANG_SKILL_ID_LIST, type SongyangSkillId } from '../skills/songyang/songyang-skill-ids';
import { describeSongyangUnlockRules } from '../skills/songyang/songyang-unlock-evaluator';

describe('Songyang skill content', () => {
  function setupRegistry(): SkillRegistry {
    const registry = new SkillRegistry();
    registerSongyangSkills(registry);
    return registry;
  }

  it('13 门技能在 SkillRegistry 可查且描述包含四段文案', () => {
    const registry = setupRegistry();

    for (const skillId of SONGYANG_SKILL_ID_LIST) {
      const skill = registry.get(skillId);
      expect(skill).toBeDefined();

      const description = skill!.getDescription(120);
      expect(description).toContain('【背景】');
      expect(description).toContain('【学习条件】');
      expect(description).toContain('【战斗公式】');
      expect(description).toContain('【扩展】');

      const unlockText = describeSongyangUnlockRules(skillId as SongyangSkillId).join(' ');
      expect(description).toContain(`【学习条件】${unlockText}`);
    }
  });

  it('blade / dodge / parry / force / cognize 行为满足类型约束', () => {
    const registry = setupRegistry();

    const bladeIds = [
      SONGYANG_SKILL_IDS.ENTRY_BLADE,
      SONGYANG_SKILL_IDS.ADVANCED_BLADE,
      SONGYANG_SKILL_IDS.ULTIMATE_BLADE,
    ];
    for (const skillId of bladeIds) {
      const skill = registry.get(skillId)!;
      expect(skill.skillType).toBe(SkillSlotType.BLADE);
      expect(skill.category).toBe(SkillCategory.MARTIAL);
      const actions = (skill as any).actions;
      expect(actions.length).toBeGreaterThan(0);
      expect(actions.every((x: any) => x.modifiers.damageType === 'slash')).toBe(true);
    }

    const dodgeIds = [
      SONGYANG_SKILL_IDS.ENTRY_DODGE,
      SONGYANG_SKILL_IDS.ADVANCED_DODGE,
      SONGYANG_SKILL_IDS.ULTIMATE_DODGE,
    ];
    for (const skillId of dodgeIds) {
      const skill = registry.get(skillId)!;
      expect(skill.skillType).toBe(SkillSlotType.DODGE);
      expect(skill.category).toBe(SkillCategory.MARTIAL);
      const actions = (skill as any).actions;
      expect(actions.length).toBeGreaterThan(0);
      expect(actions.every((x: any) => x.modifiers.dodge >= x.modifiers.attack)).toBe(true);
    }

    const parryIds = [
      SONGYANG_SKILL_IDS.ENTRY_PARRY,
      SONGYANG_SKILL_IDS.ADVANCED_PARRY,
      SONGYANG_SKILL_IDS.ULTIMATE_PARRY,
    ];
    for (const skillId of parryIds) {
      const skill = registry.get(skillId)!;
      expect(skill.skillType).toBe(SkillSlotType.PARRY);
      expect(skill.category).toBe(SkillCategory.MARTIAL);
      const actions = (skill as any).actions;
      expect(actions.length).toBeGreaterThan(0);
      expect(actions.every((x: any) => x.modifiers.parry >= x.modifiers.attack)).toBe(true);
    }

    const forceIds = [
      SONGYANG_SKILL_IDS.ENTRY_FORCE,
      SONGYANG_SKILL_IDS.ADVANCED_FORCE,
      SONGYANG_SKILL_IDS.ULTIMATE_FORCE,
    ];
    for (const skillId of forceIds) {
      const skill = registry.get(skillId)!;
      expect(skill.skillType).toBe(SkillSlotType.FORCE);
      expect(skill.category).toBe(SkillCategory.INTERNAL);
      const actions = (skill as any).actions;
      expect(actions.length).toBeGreaterThan(0);
      expect(actions.every((x: any) => x.modifiers.damageType === 'internal')).toBe(true);
      expect(actions.every((x: any) => x.costs.every((cost: any) => cost.resource === 'mp'))).toBe(
        true,
      );
    }

    const canon = registry.get(SONGYANG_SKILL_IDS.CANON_ESSENCE)!;
    expect(canon.skillType).toBe(SkillSlotType.COGNIZE);
    expect(canon.category).toBe(SkillCategory.COGNIZE);
    expect((canon as any).actions).toBeUndefined();
  });

  it('战斗公式文案与 DamageEngine 同源且不引入地形差', () => {
    const registry = setupRegistry();

    const blade = registry.get(SONGYANG_SKILL_IDS.ENTRY_BLADE)!;
    const bladeDesc = blade.getDescription(90);
    expect(bladeDesc).toContain('DamageEngine');
    expect(bladeDesc).toContain('random(0.8~1.2)');
    expect(bladeDesc).toContain('乘 0.6');

    for (const skillId of SONGYANG_SKILL_ID_LIST) {
      const description = registry.get(skillId)!.getDescription(90);
      expect(description).toContain('DamageEngine');
    }

    const dodgeDesc = registry.get(SONGYANG_SKILL_IDS.ENTRY_DODGE)!.getDescription(90);
    expect(dodgeDesc).toContain('不引入地形差');
  });
});
