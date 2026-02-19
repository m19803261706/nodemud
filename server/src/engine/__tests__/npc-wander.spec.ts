/**
 * NPC 漫游系统 (doWander) 单元测试
 *
 * 覆盖：无配置跳过、chance=0 跳过、概率命中通过出口移动+广播+通知、
 * 白名单只有当前房间时不移动、出口目标不在白名单时不移动、方向文案
 */
import { NpcBase } from '../game-objects/npc-base';
import { RoomBase } from '../game-objects/room-base';
import { ServiceLocator } from '../service-locator';
import { ObjectManager } from '../object-manager';

// mock room-utils 的 notify 函数和方向函数
jest.mock('../../websocket/handlers/room-utils', () => ({
  notifyRoomObjectAdded: jest.fn(),
  notifyRoomObjectRemoved: jest.fn(),
  getDirectionCN: (dir: string) => {
    const map: Record<string, string> = { north: '北', south: '南', east: '东', west: '西' };
    return map[dir] ?? dir;
  },
  getOppositeDirectionCN: (dir: string) => {
    const map: Record<string, string> = {
      north: '南方',
      south: '北方',
      east: '西方',
      west: '东方',
    };
    return map[dir] ?? '远方';
  },
}));

const { notifyRoomObjectAdded, notifyRoomObjectRemoved } = jest.requireMock(
  '../../websocket/handlers/room-utils',
);

describe('NPC 漫游系统 (doWander)', () => {
  let objectManager: ObjectManager;
  let roomA: RoomBase;
  let roomB: RoomBase;
  let npc: NpcBase;

  beforeEach(() => {
    objectManager = new ObjectManager();
    ServiceLocator.objectManager = objectManager;

    // 创建两个直连的房间
    roomA = new RoomBase('room/a');
    roomA.set('short', '南街');
    roomA.set('exits', { north: 'room/b' });
    objectManager.register(roomA);

    roomB = new RoomBase('room/b');
    roomB.set('short', '广场');
    roomB.set('exits', { south: 'room/a' });
    objectManager.register(roomB);

    // 创建 NPC
    npc = new NpcBase('test/beggar');
    npc.set('name', '老乞丐');
    objectManager.register(npc);

    jest.clearAllMocks();
  });

  afterEach(() => {
    ServiceLocator.reset();
  });

  it('无 wander 配置时不漫游', async () => {
    await npc.moveTo(roomA, { quiet: true });
    npc.onHeartbeat();
    expect(npc.getEnvironment()).toBe(roomA);
    expect(notifyRoomObjectRemoved).not.toHaveBeenCalled();
  });

  it('chance=0 时不漫游', async () => {
    npc.set('wander', { chance: 0, rooms: ['room/a', 'room/b'] });
    await npc.moveTo(roomA, { quiet: true });
    npc.onHeartbeat();
    expect(npc.getEnvironment()).toBe(roomA);
    expect(notifyRoomObjectRemoved).not.toHaveBeenCalled();
  });

  it('rooms 为空数组时不漫游', async () => {
    npc.set('wander', { chance: 100, rooms: [] });
    await npc.moveTo(roomA, { quiet: true });
    npc.onHeartbeat();
    expect(npc.getEnvironment()).toBe(roomA);
  });

  it('白名单只有当前房间时不移动', async () => {
    npc.set('wander', { chance: 100, rooms: ['room/a'] });
    await npc.moveTo(roomA, { quiet: true });
    npc.onHeartbeat();
    expect(npc.getEnvironment()).toBe(roomA);
    expect(notifyRoomObjectRemoved).not.toHaveBeenCalled();
  });

  it('出口目标不在白名单中时不移动', async () => {
    // roomA 有出口到 room/b，但白名单只包含 room/a 和 room/c（不存在的房间）
    npc.set('wander', { chance: 100, rooms: ['room/a', 'room/c'] });
    await npc.moveTo(roomA, { quiet: true });
    npc.onHeartbeat();
    expect(npc.getEnvironment()).toBe(roomA);
    expect(notifyRoomObjectRemoved).not.toHaveBeenCalled();
  });

  it('chance=100 时通过出口漫游到相邻房间', async () => {
    npc.set('wander', { chance: 100, rooms: ['room/a', 'room/b'] });
    await npc.moveTo(roomA, { quiet: true });

    npc.onHeartbeat();

    // NPC 应该通过 north 出口移动到 roomB
    expect(npc.getEnvironment()).toBe(roomB);
  });

  it('漫游后旧房间收到离去广播和 removeNotify', async () => {
    npc.set('wander', { chance: 100, rooms: ['room/a', 'room/b'] });
    await npc.moveTo(roomA, { quiet: true });
    const broadcastSpy = jest.spyOn(roomA, 'broadcast');

    npc.onHeartbeat();

    // 旧房间广播离去文案（包含 [emote] 和 [npc]）
    expect(broadcastSpy).toHaveBeenCalledTimes(1);
    const leaveMsg = broadcastSpy.mock.calls[0][0] as string;
    expect(leaveMsg).toContain('[emote]');
    expect(leaveMsg).toContain('[npc]老乞丐[/npc]');
    expect(leaveMsg).toContain('[/emote]');

    // 旧房间 notifyRoomObjectRemoved
    expect(notifyRoomObjectRemoved).toHaveBeenCalledWith(roomA, 'test/beggar', 'npc');
  });

  it('漫游后新房间收到到达广播和 addNotify', async () => {
    npc.set('wander', { chance: 100, rooms: ['room/a', 'room/b'] });
    await npc.moveTo(roomA, { quiet: true });
    const broadcastSpy = jest.spyOn(roomB, 'broadcast');

    npc.onHeartbeat();

    // 新房间广播到达文案
    expect(broadcastSpy).toHaveBeenCalledTimes(1);
    const arriveMsg = broadcastSpy.mock.calls[0][0] as string;
    expect(arriveMsg).toContain('[emote]');
    expect(arriveMsg).toContain('[npc]老乞丐[/npc]');

    // 新房间 notifyRoomObjectAdded
    expect(notifyRoomObjectAdded).toHaveBeenCalledWith(roomB, npc);
  });

  it('广播文案包含出口方向信息', async () => {
    npc.set('wander', { chance: 100, rooms: ['room/a', 'room/b'] });
    await npc.moveTo(roomA, { quiet: true });
    const leaveSpy = jest.spyOn(roomA, 'broadcast');
    const arriveSpy = jest.spyOn(roomB, 'broadcast');

    npc.onHeartbeat();

    // 离开文案应包含方向（北）
    const leaveMsg = leaveSpy.mock.calls[0][0] as string;
    expect(leaveMsg).toContain('北');

    // 到达文案应包含反方向（南方）
    const arriveMsg = arriveSpy.mock.calls[0][0] as string;
    expect(arriveMsg).toContain('南方');
  });

  it('多个可走出口时随机选择', async () => {
    // roomA 有两个出口，都在白名单内
    const roomC = new RoomBase('room/c');
    roomC.set('short', '东巷');
    roomC.set('exits', { west: 'room/a' });
    objectManager.register(roomC);

    roomA.set('exits', { north: 'room/b', east: 'room/c' });
    npc.set('wander', { chance: 100, rooms: ['room/a', 'room/b', 'room/c'] });
    await npc.moveTo(roomA, { quiet: true });

    npc.onHeartbeat();

    // NPC 应该移动到 roomB 或 roomC（两者之一）
    const env = npc.getEnvironment();
    expect(env === roomB || env === roomC).toBe(true);
  });

  it('漫游成功后跳过闲聊（互斥）', async () => {
    npc.set('wander', { chance: 100, rooms: ['room/a', 'room/b'] });
    npc.set('chat_chance', 100);
    npc.set('chat_msg', ['测试闲聊']);
    await npc.moveTo(roomA, { quiet: true });
    const roomASpy = jest.spyOn(roomA, 'broadcast');

    npc.onHeartbeat();

    // NPC 移动了
    expect(npc.getEnvironment()).toBe(roomB);
    // roomA 只收到离去文案（1 次），没有闲聊
    expect(roomASpy).toHaveBeenCalledTimes(1);
  });

  it('战斗中不漫游（onAI 已守卫）', async () => {
    npc.set('wander', { chance: 100, rooms: ['room/a', 'room/b'] });
    await npc.moveTo(roomA, { quiet: true });
    npc.setTemp('combat/state', 'fighting');
    npc.setTemp('combat/target', 'some-enemy');

    npc.onHeartbeat();

    expect(npc.getEnvironment()).toBe(roomA);
    expect(notifyRoomObjectRemoved).not.toHaveBeenCalled();
  });

  it('死亡状态不漫游（onAI 已守卫）', async () => {
    npc.set('wander', { chance: 100, rooms: ['room/a', 'room/b'] });
    await npc.moveTo(roomA, { quiet: true });
    npc.setTemp('combat/state', 'dead');

    npc.onHeartbeat();

    expect(npc.getEnvironment()).toBe(roomA);
    expect(notifyRoomObjectRemoved).not.toHaveBeenCalled();
  });

  it('蓝图可通过 dbase 覆盖漫游文案', async () => {
    npc.set('wander', { chance: 100, rooms: ['room/a', 'room/b'] });
    npc.set('wander_leave_msg', ['[emote][npc]{name}[/npc]踉踉跄跄地向{dir}走去。[/emote]']);
    npc.set('wander_arrive_msg', ['[emote][npc]{name}[/npc]踉踉跄跄地从{dir}走来。[/emote]']);
    await npc.moveTo(roomA, { quiet: true });
    const leaveSpy = jest.spyOn(roomA, 'broadcast');

    npc.onHeartbeat();

    const leaveMsg = leaveSpy.mock.calls[0][0] as string;
    expect(leaveMsg).toContain('踉踉跄跄');
    expect(leaveMsg).toContain('老乞丐');
  });
});
