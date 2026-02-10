/**
 * 运功效果框架 + 各效果实现单元测试
 */

// 确保装饰器注册
import '../exert/effects/recover';
import '../exert/effects/heal';
import '../exert/effects/regenerate';
import '../exert/effects/shield';
import '../exert/effects/powerup';

import { ExertEffectRegistry } from '../exert/exert-effect-registry';
import { RecoverEffect } from '../exert/effects/recover';
import { HealEffect } from '../exert/effects/heal';
import { RegenerateEffect } from '../exert/effects/regenerate';
import { ShieldEffect } from '../exert/effects/shield';
import { PowerupEffect } from '../exert/effects/powerup';
import { PlayerBase } from '../game-objects/player-base';

// ========== Mock 辅助函数 ==========

/** 创建 mock PlayerBase */
function createMockPlayer(overrides?: Record<string, any>): PlayerBase {
  const dbase: Record<string, any> = {
    hp: 50,
    max_hp: 200,
    mp: 300,
    max_mp: 500,
    energy: 50,
    max_energy: 200,
    ...overrides,
  };
  const tmpDbase: Record<string, any> = {};
  const sentMessages: any[] = [];
  const callOuts: Map<string, () => void> = new Map();
  let callOutCounter = 0;

  const player = {
    get: jest.fn((path: string) => dbase[path]),
    set: jest.fn((path: string, value: any) => {
      dbase[path] = value;
    }),
    getTemp: jest.fn((path: string) => tmpDbase[path]),
    setTemp: jest.fn((path: string, value: any) => {
      tmpDbase[path] = value;
    }),
    delTemp: jest.fn((path: string) => {
      delete tmpDbase[path];
      return true;
    }),
    getMaxHp: jest.fn(() => dbase.max_hp ?? 200),
    getMaxMp: jest.fn(() => dbase.max_mp ?? 500),
    getMaxEnergy: jest.fn(() => dbase.max_energy ?? 200),
    recoverHp: jest.fn((amount: number) => {
      const current = dbase.hp ?? 0;
      const max = dbase.max_hp ?? 200;
      const actual = Math.min(amount, max - current);
      dbase.hp = current + actual;
      return actual;
    }),
    recoverEnergy: jest.fn((amount: number) => {
      const current = dbase.energy ?? 0;
      const max = dbase.max_energy ?? 200;
      const actual = Math.min(amount, max - current);
      dbase.energy = current + actual;
      return actual;
    }),
    isInCombat: jest.fn(() => tmpDbase['combat/state'] === 'fighting'),
    sendToClient: jest.fn((data: any) => sentMessages.push(data)),
    callOut: jest.fn((fn: () => void, delay: number) => {
      const id = `co_${++callOutCounter}`;
      callOuts.set(id, fn);
      return id;
    }),
    removeCallOut: jest.fn((id: string) => {
      callOuts.delete(id);
    }),
    // 暴露内部状态给测试
    _dbase: dbase,
    _tmpDbase: tmpDbase,
    _sentMessages: sentMessages,
    _callOuts: callOuts,
  } as unknown as PlayerBase & {
    _dbase: Record<string, any>;
    _tmpDbase: Record<string, any>;
    _sentMessages: any[];
    _callOuts: Map<string, () => void>;
  };

  return player;
}

// ========== ExertEffectRegistry ==========

describe('ExertEffectRegistry', () => {
  it('注册和获取效果', () => {
    const registry = ExertEffectRegistry.getInstance();
    const recover = registry.get('recover');
    expect(recover).toBeDefined();
    expect(recover!.name).toBe('recover');
    expect(recover!.displayName).toBe('调匀气息');
  });

  it('getAll 返回所有已注册效果', () => {
    const registry = ExertEffectRegistry.getInstance();
    const all = registry.getAll();
    expect(all.length).toBeGreaterThanOrEqual(5);
    const names = all.map((e) => e.name);
    expect(names).toContain('recover');
    expect(names).toContain('heal');
    expect(names).toContain('regenerate');
    expect(names).toContain('shield');
    expect(names).toContain('powerup');
  });

  it('getUniversal 只返回通用效果', () => {
    const registry = ExertEffectRegistry.getInstance();
    const universals = registry.getUniversal();
    for (const e of universals) {
      expect(e.isUniversal).toBe(true);
    }
    const names = universals.map((e) => e.name);
    expect(names).toContain('recover');
    expect(names).toContain('heal');
    expect(names).toContain('regenerate');
    expect(names).not.toContain('shield');
    expect(names).not.toContain('powerup');
  });
});

// ========== RecoverEffect ==========

describe('RecoverEffect', () => {
  const effect = ExertEffectRegistry.getInstance().get('recover')!;

  it('正常恢复气血', () => {
    const player = createMockPlayer({ hp: 50, max_hp: 200, mp: 300 });
    const result = effect.execute(player, 'force-1', 100);
    expect(result.success).toBe(true);
    expect(result.resourceChanged).toBe(true);
    expect(player.recoverHp).toHaveBeenCalled();
  });

  it('内力不足时失败', () => {
    const player = createMockPlayer({ hp: 50, max_hp: 200, mp: 10 });
    const result = effect.execute(player, 'force-1', 100);
    expect(result.success).toBe(false);
    expect(result.resourceChanged).toBe(false);
  });

  it('气血充足时失败', () => {
    const player = createMockPlayer({ hp: 195, max_hp: 200, mp: 300 });
    const result = effect.execute(player, 'force-1', 100);
    expect(result.success).toBe(false);
    expect(result.resourceChanged).toBe(false);
  });

  it('战斗中消耗翻倍', () => {
    const player = createMockPlayer({ hp: 50, max_hp: 200, mp: 300 });
    (player as any)._tmpDbase['combat/state'] = 'fighting';

    const result = effect.execute(player, 'force-1', 100);
    expect(result.success).toBe(true);
    // 战斗中消耗翻倍，mp 减少更多
    const mpAfter = (player as any)._dbase.mp;
    expect(mpAfter).toBeLessThan(300);
  });

  it('内力不足时按比例部分恢复', () => {
    // 内力只有 30，不够全额消耗
    const player = createMockPlayer({ hp: 50, max_hp: 200, mp: 30 });
    const result = effect.execute(player, 'force-1', 50);
    expect(result.success).toBe(true);
    // 应该只恢复一部分
    expect(player.recoverHp).toHaveBeenCalled();
  });
});

// ========== HealEffect ==========

describe('HealEffect', () => {
  const effect = ExertEffectRegistry.getInstance().get('heal')! as HealEffect;

  it('开始疗伤设置 exert/healing', () => {
    const player = createMockPlayer({ hp: 50, max_hp: 200, mp: 300 });
    const result = effect.execute(player, 'force-1', 100);
    expect(result.success).toBe(true);
    expect(result.healingStarted).toBe(true);
    expect(player.setTemp).toHaveBeenCalledWith('exert/healing', true);
    expect(player.callOut).toHaveBeenCalled();
  });

  it('已在疗伤时失败', () => {
    const player = createMockPlayer({ hp: 50, max_hp: 200, mp: 300 });
    (player as any)._tmpDbase['exert/healing'] = true;
    const result = effect.execute(player, 'force-1', 100);
    expect(result.success).toBe(false);
  });

  it('内力不足时失败', () => {
    const player = createMockPlayer({ hp: 50, max_hp: 200, mp: 30 });
    const result = effect.execute(player, 'force-1', 100);
    expect(result.success).toBe(false);
  });

  it('伤势不重时失败', () => {
    // hp 180, maxHp 200, missing=20, maxHp/5=40, 20<40 → 伤势不重
    const player = createMockPlayer({ hp: 180, max_hp: 200, mp: 300 });
    const result = effect.execute(player, 'force-1', 100);
    expect(result.success).toBe(false);
  });
});

// ========== RegenerateEffect ==========

describe('RegenerateEffect', () => {
  const effect = ExertEffectRegistry.getInstance().get('regenerate')!;

  it('正常恢复精力', () => {
    const player = createMockPlayer({ energy: 50, max_energy: 200, mp: 300 });
    const result = effect.execute(player, 'force-1', 100);
    expect(result.success).toBe(true);
    expect(result.resourceChanged).toBe(true);
    expect(player.recoverEnergy).toHaveBeenCalled();
  });

  it('内力不足时失败', () => {
    const player = createMockPlayer({ energy: 50, max_energy: 200, mp: 10 });
    const result = effect.execute(player, 'force-1', 100);
    expect(result.success).toBe(false);
  });

  it('精力充足时失败', () => {
    const player = createMockPlayer({ energy: 195, max_energy: 200, mp: 300 });
    const result = effect.execute(player, 'force-1', 100);
    expect(result.success).toBe(false);
  });
});

// ========== ShieldEffect ==========

describe('ShieldEffect', () => {
  const effect = ExertEffectRegistry.getInstance().get('shield')!;

  it('正常使用设置 buff', () => {
    const player = createMockPlayer({ mp: 300 });
    const result = effect.execute(player, 'force-1', 100);
    expect(result.success).toBe(true);
    expect(result.resourceChanged).toBe(true);
    expect(player.setTemp).toHaveBeenCalledWith('exert/shield', 50); // floor(100/2)
    expect(player.callOut).toHaveBeenCalled();
  });

  it('内力不足时失败', () => {
    const player = createMockPlayer({ mp: 50 });
    const result = effect.execute(player, 'force-1', 100);
    expect(result.success).toBe(false);
  });

  it('等级不够时失败', () => {
    const player = createMockPlayer({ mp: 300 });
    const result = effect.execute(player, 'force-1', 30);
    expect(result.success).toBe(false);
  });

  it('返回正确的 buffApplied', () => {
    const player = createMockPlayer({ mp: 300 });
    const result = effect.execute(player, 'force-1', 100);
    expect(result.buffApplied).toEqual({
      name: 'shield',
      duration: 100,
      bonuses: { defense: 50 },
    });
  });
});

// ========== PowerupEffect ==========

describe('PowerupEffect', () => {
  const effect = ExertEffectRegistry.getInstance().get('powerup')!;

  it('正常使用设置 buff', () => {
    const player = createMockPlayer({ mp: 300 });
    const result = effect.execute(player, 'force-1', 100);
    expect(result.success).toBe(true);
    expect(result.resourceChanged).toBe(true);
    const bonus = Math.floor((100 * 2) / 5); // 40
    expect(player.setTemp).toHaveBeenCalledWith('exert/powerup', {
      attack: bonus,
      dodge: bonus,
      parry: bonus,
    });
  });

  it('内力不足时失败', () => {
    const player = createMockPlayer({ mp: 100 });
    const result = effect.execute(player, 'force-1', 100);
    expect(result.success).toBe(false);
  });

  it('等级不够时失败', () => {
    const player = createMockPlayer({ mp: 300 });
    const result = effect.execute(player, 'force-1', 20);
    expect(result.success).toBe(false);
  });

  it('返回正确的 buffApplied', () => {
    const player = createMockPlayer({ mp: 300 });
    const result = effect.execute(player, 'force-1', 100);
    const bonus = Math.floor((100 * 2) / 5); // 40
    expect(result.buffApplied).toEqual({
      name: 'powerup',
      duration: 100,
      bonuses: { attack: bonus, dodge: bonus, parry: bonus },
    });
  });
});
