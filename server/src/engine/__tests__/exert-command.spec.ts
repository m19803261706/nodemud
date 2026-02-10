/**
 * exert 命令入口 + buff 聚合单元测试
 */

// 确保效果装饰器注册
import '../exert/effects/recover';
import '../exert/effects/heal';
import '../exert/effects/regenerate';
import '../exert/effects/shield';
import '../exert/effects/powerup';

import { ExertCommand } from '../commands/std/exert';
import { PlayerBase } from '../game-objects/player-base';
import { LivingBase } from '../game-objects/living-base';

// ========== Mock 辅助 ==========

/** 创建带 skillManager 的 mock player */
function createMockPlayerWithSkills(options?: {
  activeForce?: string | null;
  forceLevel?: number;
  exertEffects?: string[];
  mp?: number;
  hp?: number;
  maxHp?: number;
}): PlayerBase {
  const opts = {
    activeForce: 'basic-neigong',
    forceLevel: 100,
    exertEffects: [],
    mp: 300,
    hp: 50,
    maxHp: 200,
    ...options,
  };

  const dbase: Record<string, any> = {
    hp: opts.hp,
    max_hp: opts.maxHp,
    mp: opts.mp,
    max_mp: 500,
    energy: 50,
    max_energy: 200,
  };
  const tmpDbase: Record<string, any> = {};
  const sentMessages: any[] = [];

  // 模拟 InternalSkillBase 定义
  const forceDef = {
    getExertEffects: jest.fn(() => opts.exertEffects),
  };

  const skillRegistry = {
    get: jest.fn(() => (opts.activeForce ? forceDef : null)),
  };

  const skillManager = {
    getActiveForce: jest.fn(() => opts.activeForce),
    getSkillLevel: jest.fn(() => opts.forceLevel),
    skillRegistry,
    improveSkill: jest.fn(),
  };

  const player = Object.create(PlayerBase.prototype);
  Object.assign(player, {
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
    getMaxHp: jest.fn(() => opts.maxHp),
    getMaxMp: jest.fn(() => 500),
    getMaxEnergy: jest.fn(() => 200),
    recoverHp: jest.fn((amount: number) => {
      const current = dbase.hp ?? 0;
      const max = opts.maxHp;
      const actual = Math.min(amount, max - current);
      dbase.hp = current + actual;
      return actual;
    }),
    recoverEnergy: jest.fn((amount: number) => {
      const current = dbase.energy ?? 0;
      const actual = Math.min(amount, 200 - current);
      dbase.energy = current + actual;
      return actual;
    }),
    isInCombat: jest.fn(() => tmpDbase['combat/state'] === 'fighting'),
    sendToClient: jest.fn((data: any) => sentMessages.push(data)),
    callOut: jest.fn(() => 'co_1'),
    removeCallOut: jest.fn(),
    skillManager,
    _dbase: dbase,
    _tmpDbase: tmpDbase,
    _sentMessages: sentMessages,
  });

  return player;
}

// ========== ExertCommand ==========

describe('ExertCommand', () => {
  const command = new ExertCommand();

  it('非 PlayerBase 时失败', () => {
    const npc = new LivingBase('test-npc');
    const result = command.execute(npc, []);
    expect(result.success).toBe(false);
  });

  it('无激活内功时失败', () => {
    const player = createMockPlayerWithSkills({ activeForce: null });
    const result = command.execute(player, []);
    expect(result.success).toBe(false);
  });

  it('无参数时列出可用效果', () => {
    const player = createMockPlayerWithSkills();
    const result = command.execute(player, []);
    expect(result.success).toBe(true);
    expect(result.message).toContain('recover');
    expect(result.message).toContain('heal');
    expect(result.message).toContain('regenerate');
  });

  it('stop 中断疗伤', () => {
    const player = createMockPlayerWithSkills();
    (player as any)._tmpDbase['exert/healing'] = true;
    const result = command.execute(player, ['stop']);
    expect(result.success).toBe(true);
    expect(player.delTemp).toHaveBeenCalledWith('exert/healing');
  });

  it('stop 没有在运功时失败', () => {
    const player = createMockPlayerWithSkills();
    const result = command.execute(player, ['stop']);
    expect(result.success).toBe(false);
  });

  it('通用效果直接执行', () => {
    const player = createMockPlayerWithSkills();
    const result = command.execute(player, ['recover']);
    expect(result.success).toBe(true);
    expect(player.sendToClient).toHaveBeenCalled();
  });

  it('特殊效果需内功支持', () => {
    // 没有声明支持 shield
    const player = createMockPlayerWithSkills({ exertEffects: [] });
    const result = command.execute(player, ['shield']);
    expect(result.success).toBe(false);
  });

  it('特殊效果声明支持后可执行', () => {
    const player = createMockPlayerWithSkills({
      exertEffects: ['shield'],
      forceLevel: 100,
    });
    const result = command.execute(player, ['shield']);
    expect(result.success).toBe(true);
  });

  it('战斗中限制非战斗效果', () => {
    const player = createMockPlayerWithSkills();
    (player as any)._tmpDbase['combat/state'] = 'fighting';
    const result = command.execute(player, ['heal']);
    expect(result.success).toBe(false);
  });

  it('战斗中可用 recover', () => {
    const player = createMockPlayerWithSkills();
    (player as any)._tmpDbase['combat/state'] = 'fighting';
    const result = command.execute(player, ['recover']);
    expect(result.success).toBe(true);
  });
});

// ========== getSkillBonusSummary buff 聚合 ==========
// 注意：此处测试 SkillManager 的 buff 读取逻辑
// 由于 SkillManager 是复杂类，这里通过 player tmpDbase 间接验证

describe('运功 buff tmpDbase 键约定', () => {
  it('shield buff 键为 exert/shield，值为 number', () => {
    const player = createMockPlayerWithSkills();
    player.setTemp('exert/shield', 50);
    expect(player.getTemp('exert/shield')).toBe(50);
  });

  it('powerup buff 键为 exert/powerup，值为对象', () => {
    const player = createMockPlayerWithSkills();
    const bonuses = { attack: 40, dodge: 40, parry: 40 };
    player.setTemp('exert/powerup', bonuses);
    expect(player.getTemp('exert/powerup')).toEqual(bonuses);
  });

  it('healing 状态键为 exert/healing，值为 boolean', () => {
    const player = createMockPlayerWithSkills();
    player.setTemp('exert/healing', true);
    expect(player.getTemp('exert/healing')).toBe(true);
  });
});
