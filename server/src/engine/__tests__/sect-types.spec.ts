import { PuzzleStepState, clonePlayerSectData, normalizePlayerSectData } from '../sect/types';

describe('sect types normalize/clone', () => {
  it('normalizePlayerSectData 会为缺省 songyangSkill 回填默认结构', () => {
    const normalized = normalizePlayerSectData({
      current: null,
      restrictions: { bannedSectIds: [], cooldownUntil: null },
      daily: { dateKey: '', sparCount: 0 },
    });

    expect(normalized.songyangSkill).toBeDefined();
    expect(normalized.songyangSkill?.puzzle.canjuCollected).toBe(0);
    expect(normalized.songyangSkill?.puzzle.canjuState).toBe(PuzzleStepState.NOT_STARTED);
    expect(normalized.songyangSkill?.legacy.canonCrippled).toBe(false);
  });

  it('normalizePlayerSectData 兼容旧版 puzzle 布尔字段', () => {
    const normalized = normalizePlayerSectData({
      current: null,
      restrictions: { bannedSectIds: [], cooldownUntil: null },
      daily: { dateKey: '', sparCount: 0 },
      songyangSkill: {
        puzzle: {
          canjuCollected: 3,
          duanjuPassed: true,
          shiyanPassed: false,
        },
      },
    });

    expect(normalized.songyangSkill?.puzzle.canjuState).toBe(PuzzleStepState.COMPLETED);
    expect(normalized.songyangSkill?.puzzle.duanjuState).toBe(PuzzleStepState.COMPLETED);
    expect(normalized.songyangSkill?.puzzle.shiyanState).toBe(PuzzleStepState.NOT_STARTED);
  });

  it('clonePlayerSectData 返回深拷贝，避免引用污染', () => {
    const source = normalizePlayerSectData({
      current: null,
      restrictions: { bannedSectIds: ['songyang'], cooldownUntil: null },
      daily: { dateKey: '2026-02-11', sparCount: 1 },
      songyangSkill: {
        puzzle: {
          canjuCollected: 1,
          canjuState: PuzzleStepState.IN_PROGRESS,
          duanjuState: PuzzleStepState.NOT_STARTED,
          shiyanState: PuzzleStepState.NOT_STARTED,
        },
        challenges: { chiefDiscipleWin: true, sparStreakWin: false, masterApproval: false },
        legacy: { canonCrippled: false },
      },
    });

    const cloned = clonePlayerSectData(source);
    cloned.restrictions.bannedSectIds.push('extra');
    if (cloned.songyangSkill) {
      cloned.songyangSkill.puzzle.canjuCollected = 3;
    }

    expect(source.restrictions.bannedSectIds).toEqual(['songyang']);
    expect(source.songyangSkill?.puzzle.canjuCollected).toBe(1);
  });
});
