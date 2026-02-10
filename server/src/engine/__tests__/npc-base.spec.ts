/**
 * NpcBase 单元测试
 *
 * 覆盖: virtual 标记、getName/getShort/getLong、onHeartbeat->onAI 链路、onChat
 */
import { NpcBase } from '../game-objects/npc-base';
import { MerchantBase } from '../game-objects/merchant-base';
import { BaseEntity } from '../base-entity';
import { LivingBase } from '../game-objects/living-base';

describe('NpcBase', () => {
  // ========== static virtual ==========

  it('static virtual = false，NPC 可克隆', () => {
    expect(NpcBase.virtual).toBe(false);
  });

  // ========== getName ==========

  describe('getName()', () => {
    it('有 name 属性时返回 dbase 值', () => {
      const npc = new NpcBase('test/npc');
      npc.set('name', '店小二');
      expect(npc.getName()).toBe('店小二');
    });

    it('无 name 属性时返回默认值 "无名"', () => {
      const npc = new NpcBase('test/npc');
      expect(npc.getName()).toBe('无名');
    });
  });

  // ========== getShort ==========

  describe('getShort()', () => {
    it('有 short 属性时返回 dbase 值', () => {
      const npc = new NpcBase('test/npc');
      npc.set('short', '一个忙碌的店小二');
      expect(npc.getShort()).toBe('一个忙碌的店小二');
    });

    it('无 short 属性时 fallback 到 getName()', () => {
      const npc = new NpcBase('test/npc');
      npc.set('name', '店小二');
      expect(npc.getShort()).toBe('店小二');
    });

    it('name 和 short 都无时返回默认值 "无名"', () => {
      const npc = new NpcBase('test/npc');
      expect(npc.getShort()).toBe('无名');
    });
  });

  // ========== getLong ==========

  describe('getLong()', () => {
    it('有 long 属性时返回 dbase 值', () => {
      const npc = new NpcBase('test/npc');
      npc.set('long', '这是一个勤快的店小二，正在擦桌子。');
      expect(npc.getLong()).toBe('这是一个勤快的店小二，正在擦桌子。');
    });

    it('无 long 属性时返回包含 getName() 的默认描述', () => {
      const npc = new NpcBase('test/npc');
      npc.set('name', '店小二');
      expect(npc.getLong()).toBe('你看到了店小二。');
    });

    it('name 和 long 都无时使用默认名字', () => {
      const npc = new NpcBase('test/npc');
      expect(npc.getLong()).toBe('你看到了无名。');
    });
  });

  // ========== onHeartbeat -> onAI ==========

  describe('onHeartbeat() -> onAI() 链路', () => {
    it('onHeartbeat 调用 onAI', () => {
      // 创建测试子类，覆写 onAI 记录调用
      class TestNpc extends NpcBase {
        aiCalled = false;
        protected onAI(): void {
          this.aiCalled = true;
        }
      }

      const npc = new TestNpc('test/npc');
      expect(npc.aiCalled).toBe(false);
      npc.onHeartbeat();
      expect(npc.aiCalled).toBe(true);
    });

    it('子类可覆写 onAI 实现自定义行为', () => {
      const actions: string[] = [];

      class PatrolNpc extends NpcBase {
        protected onAI(): void {
          actions.push('patrol');
        }
      }

      const npc = new PatrolNpc('test/patrol');
      npc.onHeartbeat();
      npc.onHeartbeat();
      expect(actions).toEqual(['patrol', 'patrol']);
    });
  });

  // ========== onChat ==========

  describe('onChat()', () => {
    it('接收参数不报错', () => {
      const npc = new NpcBase('test/npc');
      const speaker = new BaseEntity('player/test');
      expect(() => npc.onChat(speaker, '你好')).not.toThrow();
    });

    it('子类可覆写 onChat 处理对话', () => {
      const replies: string[] = [];

      class TalkativeNpc extends NpcBase {
        onChat(speaker: BaseEntity, message: string): void {
          replies.push(`收到: ${message}`);
        }
      }

      const npc = new TalkativeNpc('test/npc');
      const speaker = new BaseEntity('player/test');
      npc.onChat(speaker, '你好');
      expect(replies).toEqual(['收到: 你好']);
    });
  });

  // ========== 继承验证 ==========

  describe('继承链验证', () => {
    it('NpcBase 是 LivingBase 的子类', () => {
      const npc = new NpcBase('test/npc');
      expect(npc).toBeInstanceOf(LivingBase);
    });

    it('NpcBase 是 BaseEntity 的子类', () => {
      const npc = new NpcBase('test/npc');
      expect(npc).toBeInstanceOf(BaseEntity);
    });

    it('可以使用 BaseEntity 的 dbase API', () => {
      const npc = new NpcBase('test/npc');
      npc.set('hp', 100);
      expect(npc.get('hp')).toBe(100);
    });
  });

  // ========== 交互能力 ==========

  describe('getInteractionCapabilities()', () => {
    it('默认 NPC：可攻击，不可给予，不含商店能力', () => {
      const npc = new NpcBase('test/npc');
      const caps = npc.getInteractionCapabilities();
      expect(caps).toEqual({
        chat: false,
        give: false,
        attack: true,
        shopList: false,
        shopSell: false,
      });
    });

    it('有 inquiry 时启用对话能力', () => {
      const npc = new NpcBase('test/npc');
      npc.set('inquiry', { default: '你好。' });
      expect(npc.getInteractionCapabilities().chat).toBe(true);
    });

    it('can_receive_item 可显式开启给予能力', () => {
      const npc = new NpcBase('test/npc');
      npc.set('can_receive_item', true);
      expect(npc.getInteractionCapabilities().give).toBe(true);
    });

    it('attackable=false 时不可攻击', () => {
      const npc = new NpcBase('test/npc');
      npc.set('attackable', false);
      expect(npc.getInteractionCapabilities().attack).toBe(false);
    });

    it('商人默认启用货单和出售能力', () => {
      const merchant = new MerchantBase('test/merchant');
      const caps = merchant.getInteractionCapabilities();
      expect(caps.shopList).toBe(true);
      expect(caps.shopSell).toBe(true);
    });

    it('商人关闭回收后禁用出售能力', () => {
      const merchant = new MerchantBase('test/merchant');
      merchant.set('shop_recycle', { enabled: false });
      expect(merchant.getInteractionCapabilities().shopSell).toBe(false);
    });
  });
});
