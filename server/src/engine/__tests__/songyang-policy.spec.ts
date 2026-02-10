import { SongyangPolicy } from '../sect/policies/songyang.policy';

describe('SongyangPolicy ranks', () => {
  const policy = new SongyangPolicy();

  it('应按贡献映射更细粒度门派职位', () => {
    expect(policy.resolveRankByContribution(0)).toBe('外门弟子');
    expect(policy.resolveRankByContribution(300)).toBe('内门弟子');
    expect(policy.resolveRankByContribution(1200)).toBe('执礼弟子');
    expect(policy.resolveRankByContribution(3000)).toBe('亲传弟子');
    expect(policy.resolveRankByContribution(8000)).toBe('嵩阳执事');
    expect(policy.resolveRankByContribution(16000)).toBe('嵩阳长老');
    expect(policy.resolveRankByContribution(32000)).toBe('首座长老');
    expect(policy.resolveRankByContribution(64000)).toBe('副掌门');
  });
});
