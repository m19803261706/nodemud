import { SkillCategory, SkillSlotType } from '@packages/core';
import { PlayerBase } from '../game-objects/player-base';
import { SkillManager, type PlayerSkillData } from '../skills/skill-manager';
import { SkillRegistry } from '../skills/skill-registry';
import { SkillBase } from '../skills/skill-base';
import { registerSongyangSkills } from '../skills/songyang/register-songyang-skills';
import { SONGYANG_SKILL_IDS } from '../skills/songyang/songyang-skill-ids';
import { normalizePlayerSectData } from '../sect/types';

class NeutralStudySkill extends SkillBase {
  get skillId(): string {
    return 'neutral-study';
  }

  get skillName(): string {
    return '中州杂学';
  }

  get skillType(): SkillSlotType {
    return SkillSlotType.COGNIZE;
  }

  get category(): SkillCategory {
    return SkillCategory.SUPPORT;
  }
}

function createManager(options?: { canonCrippled?: boolean }): {
  player: PlayerBase;
  manager: SkillManager;
} {
  const player = new PlayerBase('player/test');
  player.set('name', '测试玩家');
  player.set('strength', 10);
  player.set('vitality', 10);
  player.set('perception', 10);
  player.set('spirit', 10);
  player.set('wisdom', 0);
  player.set('meridian', 10);

  player.set(
    'sect',
    normalizePlayerSectData({
      current: null,
      restrictions: { bannedSectIds: ['songyang'], cooldownUntil: null },
      daily: { dateKey: '2026-02-10', sparCount: 0 },
      songyangSkill: {
        puzzle: {
          canjuCollected: 3,
          canjuState: 'completed',
          duanjuState: 'completed',
          shiyanState: 'completed',
        },
        challenges: {
          chiefDiscipleWin: true,
          sparStreakWin: true,
          masterApproval: true,
        },
        legacy: {
          canonCrippled: options?.canonCrippled ?? false,
        },
      },
    }),
  );

  const registry = new SkillRegistry();
  registerSongyangSkills(registry);
  registry.register(new NeutralStudySkill());

  const skillService = {
    findByCharacter: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
  };

  const manager = new SkillManager(player, skillService as any, registry);
  return { player, manager };
}

function seedSkill(
  manager: SkillManager,
  skillId: string,
  level: number,
  overrides?: Partial<PlayerSkillData>,
): void {
  const skillDef = (manager as any).skillRegistry.get(skillId);
  const data: PlayerSkillData = {
    dbId: `db-${skillId}`,
    skillId,
    skillType: skillDef.skillType,
    level,
    learned: 0,
    isMapped: false,
    mappedSlot: null,
    isActiveForce: false,
    isLocked: false,
    dirty: false,
    ...(overrides ?? {}),
  };
  (manager as any).skills.set(skillId, data);
}

describe('Songyang crippled legacy', () => {
  it('叛门清理会保留总纲并锁定，其余同门技能正常移除', () => {
    const { manager } = createManager();
    seedSkill(manager, SONGYANG_SKILL_IDS.CANON_ESSENCE, 180, {
      isMapped: true,
      mappedSlot: SkillSlotType.COGNIZE,
    });
    seedSkill(manager, SONGYANG_SKILL_IDS.ENTRY_BLADE, 80);
    (manager as any).skillMap.set(SkillSlotType.COGNIZE, SONGYANG_SKILL_IDS.CANON_ESSENCE);

    const removed = manager.removeSkillsByFaction('songyang');
    const all = manager.getAllSkills();
    const canon = all.find((x) => x.skillId === SONGYANG_SKILL_IDS.CANON_ESSENCE);

    expect(removed).toContain(SONGYANG_SKILL_IDS.ENTRY_BLADE);
    expect(removed).not.toContain(SONGYANG_SKILL_IDS.CANON_ESSENCE);
    expect(canon).toBeDefined();
    expect(canon?.isLocked).toBe(true);
    expect(canon?.isMapped).toBe(false);
    expect(manager.getSkillMap().cognize).toBeUndefined();
  });

  it('残缺总纲 mapSkill 返回契约文案并拒绝装配', () => {
    const { manager } = createManager({ canonCrippled: true });
    seedSkill(manager, SONGYANG_SKILL_IDS.CANON_ESSENCE, 200, { isLocked: true });

    const result = manager.mapSkill(SkillSlotType.COGNIZE, SONGYANG_SKILL_IDS.CANON_ESSENCE);
    expect(result).toBe('此传承已残缺，无法再运使。');
  });

  it('残缺总纲 improveSkill 不可继续提升', () => {
    const { manager } = createManager({ canonCrippled: true });
    seedSkill(manager, SONGYANG_SKILL_IDS.CANON_ESSENCE, 200, {
      isLocked: true,
      learned: 99,
    });

    const improved = manager.improveSkill(SONGYANG_SKILL_IDS.CANON_ESSENCE, 1);
    const canon = manager.getAllSkills().find((x) => x.skillId === SONGYANG_SKILL_IDS.CANON_ESSENCE);

    expect(improved).toBe(false);
    expect(canon?.level).toBe(200);
    expect(canon?.learned).toBe(99);
  });

  it('残篇被动可为其他技能保留二成学习效率', () => {
    const base = createManager({ canonCrippled: false });
    const legacy = createManager({ canonCrippled: true });

    seedSkill(base.manager, 'neutral-study', 10);
    seedSkill(legacy.manager, 'neutral-study', 10);
    seedSkill(legacy.manager, SONGYANG_SKILL_IDS.CANON_ESSENCE, 80, { isLocked: true });

    base.manager.improveSkill('neutral-study', 1);
    legacy.manager.improveSkill('neutral-study', 1);

    const baseLearned = base.manager.getAllSkills().find((x) => x.skillId === 'neutral-study')?.learned ?? 0;
    const legacyLearned =
      legacy.manager.getAllSkills().find((x) => x.skillId === 'neutral-study')?.learned ?? 0;

    expect(legacyLearned).toBeGreaterThan(baseLearned);
  });
});
