/**
 * PlayerBase 单元测试
 *
 * 覆盖: virtual 标记、连接管理、消息发送、权限、继承
 */
import { PlayerBase } from '../game-objects/player-base';
import { LivingBase } from '../game-objects/living-base';
import { Permission } from '../types/command';

describe('PlayerBase', () => {
  // ========== static virtual ==========

  it('static virtual = false，玩家可克隆', () => {
    expect(PlayerBase.virtual).toBe(false);
  });

  // ========== 连接管理 ==========

  describe('bindConnection / unbindConnection', () => {
    it('bindConnection 绑定发送回调', () => {
      const player = new PlayerBase('player/test');
      const callback = jest.fn();
      player.bindConnection(callback);
      expect(player.isConnected()).toBe(true);
    });

    it('unbindConnection 解绑发送回调', () => {
      const player = new PlayerBase('player/test');
      const callback = jest.fn();
      player.bindConnection(callback);
      player.unbindConnection();
      expect(player.isConnected()).toBe(false);
    });
  });

  // ========== isConnected ==========

  describe('isConnected()', () => {
    it('未绑定时返回 false', () => {
      const player = new PlayerBase('player/test');
      expect(player.isConnected()).toBe(false);
    });

    it('绑定后返回 true', () => {
      const player = new PlayerBase('player/test');
      player.bindConnection(jest.fn());
      expect(player.isConnected()).toBe(true);
    });

    it('解绑后返回 false', () => {
      const player = new PlayerBase('player/test');
      player.bindConnection(jest.fn());
      player.unbindConnection();
      expect(player.isConnected()).toBe(false);
    });
  });

  // ========== sendToClient ==========

  describe('sendToClient()', () => {
    it('通过回调发送数据到客户端', () => {
      const player = new PlayerBase('player/test');
      const callback = jest.fn();
      player.bindConnection(callback);

      const data = { type: 'test', data: { msg: 'hello' } };
      player.sendToClient(data);

      expect(callback).toHaveBeenCalledWith(data);
    });

    it('未绑定时调用不报错', () => {
      const player = new PlayerBase('player/test');
      expect(() => player.sendToClient({ type: 'test' })).not.toThrow();
    });

    it('未绑定时不触发回调', () => {
      const player = new PlayerBase('player/test');
      const callback = jest.fn();
      player.bindConnection(callback);
      player.unbindConnection();

      player.sendToClient({ type: 'test' });
      expect(callback).not.toHaveBeenCalled();
    });
  });

  // ========== receiveMessage ==========

  describe('receiveMessage()', () => {
    it('将消息转发到客户端', () => {
      const player = new PlayerBase('player/test');
      const callback = jest.fn();
      player.bindConnection(callback);

      player.receiveMessage('你来到了长安城。');

      expect(callback).toHaveBeenCalledWith({
        type: 'message',
        data: { content: '你来到了长安城。' },
      });
    });

    it('未绑定时调用不报错', () => {
      const player = new PlayerBase('player/test');
      expect(() => player.receiveMessage('测试消息')).not.toThrow();
    });
  });

  // ========== getPermission ==========

  describe('getPermission()', () => {
    it('默认返回 Permission.PLAYER', () => {
      const player = new PlayerBase('player/test');
      expect(player.getPermission()).toBe(Permission.PLAYER);
    });

    it('从 dbase 读取权限值', () => {
      const player = new PlayerBase('player/test');
      player.set('permission', Permission.WIZARD);
      expect(player.getPermission()).toBe(Permission.WIZARD);
    });

    it('设置 ADMIN 权限', () => {
      const player = new PlayerBase('player/test');
      player.set('permission', Permission.ADMIN);
      expect(player.getPermission()).toBe(Permission.ADMIN);
    });
  });

  // ========== 继承验证 ==========

  describe('继承 LivingBase', () => {
    it('PlayerBase 是 LivingBase 的子类', () => {
      const player = new PlayerBase('player/test');
      expect(player).toBeInstanceOf(LivingBase);
    });

    it('可以使用 LivingBase 的 getName/getShort/getLong', () => {
      const player = new PlayerBase('player/test');
      player.set('name', '大侠');
      expect(player.getName()).toBe('大侠');
      expect(player.getShort()).toBe('大侠');
      expect(player.getLong()).toBe('你看到了大侠。');
    });

    it('可以使用 BaseEntity 的 dbase API', () => {
      const player = new PlayerBase('player/test');
      player.set('hp', 200);
      expect(player.get('hp')).toBe(200);
    });
  });
});
