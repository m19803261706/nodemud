import SongyangMentorHe from '../../world/npc/songyang/mentor-he';
import SongyangElderXu from '../../world/npc/songyang/elder-xu';
import SongyangMasterLi from '../../world/npc/songyang/master-li';
import { SONGYANG_SKILL_IDS } from '../skills/songyang/songyang-skill-ids';

describe('Songyang NPC teaching config', () => {
  it('何教习应教授 4 门入门技能', () => {
    const npc = new SongyangMentorHe('npc/songyang/mentor-he#1');
    npc.create();

    expect(npc.get<number>('teach_cost')).toBe(20);
    expect(npc.get<string[]>('teach_skills')).toEqual([
      SONGYANG_SKILL_IDS.ENTRY_BLADE,
      SONGYANG_SKILL_IDS.ENTRY_DODGE,
      SONGYANG_SKILL_IDS.ENTRY_PARRY,
      SONGYANG_SKILL_IDS.ENTRY_FORCE,
    ]);
    expect(npc.get<Record<string, number>>('teach_skill_levels')).toEqual({
      [SONGYANG_SKILL_IDS.ENTRY_BLADE]: 60,
      [SONGYANG_SKILL_IDS.ENTRY_DODGE]: 60,
      [SONGYANG_SKILL_IDS.ENTRY_PARRY]: 60,
      [SONGYANG_SKILL_IDS.ENTRY_FORCE]: 60,
    });
  });

  it('许长老应教授 4 门进阶技能', () => {
    const npc = new SongyangElderXu('npc/songyang/elder-xu#1');
    npc.create();

    expect(npc.get<number>('teach_cost')).toBe(60);
    expect(npc.get<string[]>('teach_skills')).toEqual([
      SONGYANG_SKILL_IDS.ADVANCED_BLADE,
      SONGYANG_SKILL_IDS.ADVANCED_DODGE,
      SONGYANG_SKILL_IDS.ADVANCED_PARRY,
      SONGYANG_SKILL_IDS.ADVANCED_FORCE,
    ]);
    expect(npc.get<Record<string, number>>('teach_skill_levels')).toEqual({
      [SONGYANG_SKILL_IDS.ADVANCED_BLADE]: 120,
      [SONGYANG_SKILL_IDS.ADVANCED_DODGE]: 120,
      [SONGYANG_SKILL_IDS.ADVANCED_PARRY]: 120,
      [SONGYANG_SKILL_IDS.ADVANCED_FORCE]: 120,
    });
  });

  it('李掌门应教授最终 4 门与总纲', () => {
    const npc = new SongyangMasterLi('npc/songyang/master-li#1');
    npc.create();

    expect(npc.get<number>('teach_cost')).toBe(120);
    expect(npc.get<string[]>('teach_skills')).toEqual([
      SONGYANG_SKILL_IDS.ULTIMATE_BLADE,
      SONGYANG_SKILL_IDS.ULTIMATE_DODGE,
      SONGYANG_SKILL_IDS.ULTIMATE_PARRY,
      SONGYANG_SKILL_IDS.ULTIMATE_FORCE,
      SONGYANG_SKILL_IDS.CANON_ESSENCE,
    ]);
    expect(npc.get<Record<string, number>>('teach_skill_levels')).toEqual({
      [SONGYANG_SKILL_IDS.ULTIMATE_BLADE]: 180,
      [SONGYANG_SKILL_IDS.ULTIMATE_DODGE]: 180,
      [SONGYANG_SKILL_IDS.ULTIMATE_PARRY]: 180,
      [SONGYANG_SKILL_IDS.ULTIMATE_FORCE]: 180,
      [SONGYANG_SKILL_IDS.CANON_ESSENCE]: 220,
    });
  });
});
