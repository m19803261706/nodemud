/**
 * LivingBase 单元测试
 *
 * 覆盖: getName/getShort/getLong、go() 移动、executeCommand、getPermission、receiveMessage
 */
import { LivingBase } from '../game-objects/living-base';
import { RoomBase } from '../game-objects/room-base';
import { BaseEntity } from '../base-entity';
import { ServiceLocator } from '../service-locator';
import { Permission } from '../types/command';

describe('LivingBase', () => {
  beforeEach(() => {
    ServiceLocator.reset();
  });

  // ========== getName ==========

  describe('getName()', () => {
    it('有 name 属性时返回 dbase 值', () => {
      const living = new LivingBase('test/living');
      living.set('name', '张三');
      expect(living.getName()).toBe('张三');
    });

    it('无 name 属性时返回默认值 "无名"', () => {
      const living = new LivingBase('test/living');
      expect(living.getName()).toBe('无名');
    });
  });

  // ========== getShort ==========

  describe('getShort()', () => {
    it('有 short 属性时返回 dbase 值', () => {
      const living = new LivingBase('test/living');
      living.set('short', '一个年轻侠客');
      expect(living.getShort()).toBe('一个年轻侠客');
    });

    it('无 short 属性时 fallback 到 getName()', () => {
      const living = new LivingBase('test/living');
      living.set('name', '张三');
      expect(living.getShort()).toBe('张三');
    });

    it('name 和 short 都无时返回默认值 "无名"', () => {
      const living = new LivingBase('test/living');
      expect(living.getShort()).toBe('无名');
    });
  });

  // ========== getLong ==========

  describe('getLong()', () => {
    it('有 long 属性时返回 dbase 值', () => {
      const living = new LivingBase('test/living');
      living.set('long', '这是一个身穿白衣的剑客。');
      expect(living.getLong()).toBe('这是一个身穿白衣的剑客。');
    });

    it('无 long 属性时返回包含 getName() 的默认描述', () => {
      const living = new LivingBase('test/living');
      living.set('name', '张三');
      expect(living.getLong()).toBe('你看到了张三。');
    });

    it('name 和 long 都无时使用默认名字', () => {
      const living = new LivingBase('test/living');
      expect(living.getLong()).toBe('你看到了无名。');
    });
  });

  // ========== go ==========

  describe('go()', () => {
    it('成功移动到目标房间', async () => {
      // 创建源房间和目标房间
      const sourceRoom = new RoomBase('room/source');
      sourceRoom.set('exits', { north: 'room/target' });

      const targetRoom = new RoomBase('room/target');

      // 将 living 放入源房间
      const living = new LivingBase('test/living');
      await living.moveTo(sourceRoom, { quiet: true });

      // mock ServiceLocator
      ServiceLocator.initialize({
        heartbeatManager: {} as any,
        objectManager: {} as any,
        blueprintFactory: {
          getVirtual: jest.fn().mockReturnValue(targetRoom),
        } as any,
      });

      const result = await living.go('north');
      expect(result).toBe(true);
      expect(living.getEnvironment()).toBe(targetRoom);
    });

    it('无出口返回 false', async () => {
      const sourceRoom = new RoomBase('room/source');
      sourceRoom.set('exits', {});

      const living = new LivingBase('test/living');
      await living.moveTo(sourceRoom, { quiet: true });

      ServiceLocator.initialize({
        heartbeatManager: {} as any,
        objectManager: {} as any,
        blueprintFactory: {
          getVirtual: jest.fn(),
        } as any,
      });

      const result = await living.go('north');
      expect(result).toBe(false);
    });

    it('不在房间中返回 false', async () => {
      const living = new LivingBase('test/living');
      // 不放入任何房间（environment = null）

      const result = await living.go('north');
      expect(result).toBe(false);
    });

    it('在非 RoomBase 容器中返回 false', async () => {
      const container = new BaseEntity('container/bag');
      const living = new LivingBase('test/living');
      await living.moveTo(container, { quiet: true });

      const result = await living.go('north');
      expect(result).toBe(false);
    });

    it('ServiceLocator 未初始化返回 false', async () => {
      const sourceRoom = new RoomBase('room/source');
      sourceRoom.set('exits', { north: 'room/target' });

      const living = new LivingBase('test/living');
      await living.moveTo(sourceRoom, { quiet: true });

      // ServiceLocator 未初始化
      const result = await living.go('north');
      expect(result).toBe(false);
    });

    it('目标房间不存在返回 false', async () => {
      const sourceRoom = new RoomBase('room/source');
      sourceRoom.set('exits', { north: 'room/nonexistent' });

      const living = new LivingBase('test/living');
      await living.moveTo(sourceRoom, { quiet: true });

      ServiceLocator.initialize({
        heartbeatManager: {} as any,
        objectManager: {} as any,
        blueprintFactory: {
          getVirtual: jest.fn().mockReturnValue(undefined),
        } as any,
      });

      const result = await living.go('north');
      expect(result).toBe(false);
    });
  });

  // ========== executeCommand ==========

  describe('executeCommand()', () => {
    it('委托 CommandManager 执行指令', () => {
      const mockResult = { success: true, message: '你向北走去。' };
      const mockCommandManager = {
        execute: jest.fn().mockReturnValue(mockResult),
      };

      ServiceLocator.initialize({
        heartbeatManager: {} as any,
        objectManager: {} as any,
      });
      // 手动设置 commandManager（Layer 4 尚未注册到 ServiceLocator）
      (ServiceLocator as any).commandManager = mockCommandManager;

      const living = new LivingBase('test/living');
      const result = living.executeCommand('go north');

      expect(mockCommandManager.execute).toHaveBeenCalledWith(living, 'go north');
      expect(result).toEqual(mockResult);
    });

    it('ServiceLocator 未初始化时返回失败', () => {
      const living = new LivingBase('test/living');
      const result = living.executeCommand('go north');

      expect(result).toEqual({ success: false, message: '指令系统未初始化' });
    });

    it('commandManager 未注册时返回失败', () => {
      // 确保 commandManager 不存在
      delete (ServiceLocator as any).commandManager;

      ServiceLocator.initialize({
        heartbeatManager: {} as any,
        objectManager: {} as any,
      });

      const living = new LivingBase('test/living');
      const result = living.executeCommand('go north');

      expect(result).toEqual({ success: false, message: '指令系统未初始化' });
    });
  });

  // ========== getPermission ==========

  describe('getPermission()', () => {
    it('有 permission 属性时从 dbase 读取', () => {
      const living = new LivingBase('test/living');
      living.set('permission', Permission.WIZARD);
      expect(living.getPermission()).toBe(Permission.WIZARD);
    });

    it('无 permission 属性时默认返回 NPC', () => {
      const living = new LivingBase('test/living');
      expect(living.getPermission()).toBe(Permission.NPC);
    });

    it('支持所有权限等级', () => {
      const living = new LivingBase('test/living');

      living.set('permission', Permission.GUEST);
      expect(living.getPermission()).toBe(Permission.GUEST);

      living.set('permission', Permission.PLAYER);
      expect(living.getPermission()).toBe(Permission.PLAYER);

      living.set('permission', Permission.ADMIN);
      expect(living.getPermission()).toBe(Permission.ADMIN);
    });
  });

  // ========== receiveMessage ==========

  describe('receiveMessage()', () => {
    it('调用不报错（空实现）', () => {
      const living = new LivingBase('test/living');
      expect(() => living.receiveMessage('你好')).not.toThrow();
    });

    it('子类可覆写实现消息推送', () => {
      const messages: string[] = [];

      class TestLiving extends LivingBase {
        receiveMessage(msg: string): void {
          messages.push(msg);
        }
      }

      const living = new TestLiving('test/living');
      living.receiveMessage('欢迎来到江湖');
      expect(messages).toEqual(['欢迎来到江湖']);
    });
  });

  // ========== 继承验证 ==========

  describe('继承 BaseEntity', () => {
    it('LivingBase 是 BaseEntity 的子类', () => {
      const living = new LivingBase('test/living');
      expect(living).toBeInstanceOf(BaseEntity);
    });

    it('可以使用 BaseEntity 的 dbase API', () => {
      const living = new LivingBase('test/living');
      living.set('hp', 100);
      expect(living.get('hp')).toBe(100);
    });
  });
});
