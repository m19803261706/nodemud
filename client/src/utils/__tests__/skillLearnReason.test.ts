import { getSkillLearnFailureHint } from '../skillLearnReason';

describe('getSkillLearnFailureHint', () => {
  it('可读化已定义的解锁失败原因', () => {
    expect(getSkillLearnFailureHint('unlock_puzzle_duanju_required')).toContain(
      '碑文断句',
    );
    expect(getSkillLearnFailureHint('unlock_rank_required')).toContain('职位');
  });

  it('未知原因返回空', () => {
    expect(getSkillLearnFailureHint('unknown_reason')).toBeNull();
    expect(getSkillLearnFailureHint(undefined)).toBeNull();
  });
});
