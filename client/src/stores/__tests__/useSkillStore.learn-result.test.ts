import type { SkillLearnResultData } from '@packages/core';
import { useSkillStore } from '../useSkillStore';

const INITIAL_PRACTICE = {
  active: false,
  skillId: null,
  skillName: null,
  mode: null,
  currentLevel: 0,
  learned: 0,
  learnedMax: 0,
};

function resetSkillStore() {
  useSkillStore.setState({
    skills: [],
    skillMap: {},
    activeForce: null,
    bonusSummary: null,
    practiceState: INITIAL_PRACTICE,
    skillDetail: null,
    masterTeach: null,
    lastLearnFailure: null,
    lastLearnResult: null,
  });
}

describe('useSkillStore.applyLearnResult', () => {
  beforeEach(() => {
    resetSkillStore();
  });

  it('失败结果会写入 reason 与可读 hint', () => {
    const payload: SkillLearnResultData = {
      success: false,
      skillId: 'songyang-entry-blade',
      skillName: '嵩阳入门刀法',
      timesCompleted: 0,
      timesRequested: 1,
      currentLevel: 5,
      learned: 10,
      learnedMax: 36,
      levelUp: false,
      message: '潜能不足，无法继续学习。',
      reason: 'insufficient_potential',
    };

    useSkillStore.getState().applyLearnResult(payload);
    const state = useSkillStore.getState();

    expect(state.lastLearnFailure?.reason).toBe('insufficient_potential');
    expect(state.lastLearnFailure?.hint).toContain('潜能');
    expect(state.lastLearnResult?.success).toBe(false);
    expect(state.lastLearnResult?.timesCompleted).toBe(0);
    expect(state.lastLearnResult?.timesRequested).toBe(1);
  });

  it('部分成功会记录完成次数与中断原因', () => {
    const payload: SkillLearnResultData = {
      success: true,
      skillId: 'songyang-entry-blade',
      skillName: '嵩阳入门刀法',
      timesCompleted: 2,
      timesRequested: 5,
      currentLevel: 8,
      learned: 14,
      learnedMax: 81,
      levelUp: false,
      message: '你向何教习学习了2次「嵩阳入门刀法」。（因精力不足中断）',
      reason: 'insufficient_energy',
    };

    useSkillStore.getState().applyLearnResult(payload);
    const state = useSkillStore.getState();

    expect(state.lastLearnFailure).toBeNull();
    expect(state.lastLearnResult?.success).toBe(true);
    expect(state.lastLearnResult?.timesCompleted).toBe(2);
    expect(state.lastLearnResult?.timesRequested).toBe(5);
    expect(state.lastLearnResult?.reason).toBe('insufficient_energy');
    expect(state.lastLearnResult?.hint).toContain('精力');
  });
});
