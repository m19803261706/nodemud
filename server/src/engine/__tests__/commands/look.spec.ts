/**
 * look 指令单元测试
 *
 * 测试场景:
 * 1. 无参数查看房间信息
 * 2. 查看指定对象详情
 * 3. 不在环境中返回错误
 * 4. 查看不存在的目标返回错误
 * 5. 别名 'l' 和 '看' 通过装饰器正确注册
 */
import 'reflect-metadata';
import { LookCommand } from '../../commands/std/look';
import { LivingBase } from '../../game-objects/living-base';
import { RoomBase } from '../../game-objects/room-base';
import { NpcBase } from '../../game-objects/npc-base';
import { MerchantBase } from '../../game-objects/merchant-base';
import { BaseEntity } from '../../base-entity';
import { PlayerBase } from '../../game-objects/player-base';
import { ServiceLocator } from '../../service-locator';
import { COMMAND_META_KEY } from '../../types/command';

describe('LookCommand', () => {
  let cmd: LookCommand;

  beforeEach(() => {
    cmd = new LookCommand();
    ServiceLocator.reset();
  });

  afterEach(() => {
    ServiceLocator.reset();
  });

  it('无参数时显示房间信息', async () => {
    // 准备房间
    const room = new RoomBase('yangzhou/street');
    room.set('short', '扬州大街');
    room.set('long', '青石板铺就的宽阔大街，两旁店铺林立。');
    room.set('exits', { north: 'yangzhou/inn', south: 'yangzhou/gate' });

    // 准备执行者
    const player = new LivingBase('player#1');
    player.set('name', '张三');
    player.set('short', '少年张三');
    await player.moveTo(room, { quiet: true });

    // 房间里另一个 NPC
    const npc = new LivingBase('npc/guard#1');
    npc.set('name', '守卫');
    npc.set('short', '一名守卫');
    await npc.moveTo(room, { quiet: true });

    const result = cmd.execute(player, []);

    expect(result.success).toBe(true);
    // 富文本标记: 房间名用 [rn][b]...[/b][/rn]
    expect(result.message).toContain('[rn][b]扬州大街[/b][/rn]');
    // 房间描述用 [rd]...[/rd]
    expect(result.message).toContain('[rd]青石板铺就的宽阔大街');
    // 出口用 [exit]...[/exit]
    expect(result.message).toContain('[exit]出口: north、south[/exit]');
    // NPC 用 [npc]...[/npc]
    expect(result.message).toContain('[npc]一名守卫[/npc]');
    // 前缀 "这里有" 用 [sys]
    expect(result.message).toContain('[sys]这里有: [/sys]');
    // data 结构化信息
    expect(result.data.short).toBe('扬州大街');
    expect(result.data.exits).toContain('north');
    expect(result.data.exits).toContain('south');
    expect(result.data.items).toContain('一名守卫');
    // 不应包含自己
    expect(result.data.items).not.toContain('少年张三');
  });

  it('look <target> 显示对象详情', async () => {
    const room = new RoomBase('yangzhou/inn');
    room.set('short', '客栈大堂');

    const player = new LivingBase('player#1');
    player.set('name', '张三');
    await player.moveTo(room, { quiet: true });

    const npc = new LivingBase('npc/innkeeper#1');
    npc.set('name', '店小二');
    npc.set('short', '店小二');
    npc.set('long', '一个机灵的小伙计，手里拿着一块抹布。');
    await npc.moveTo(room, { quiet: true });

    // 按名字搜索
    const result = cmd.execute(player, ['店小二']);

    expect(result.success).toBe(true);
    // lookAtTarget 返回 [rd]...[/rd] 包裹的描述
    expect(result.message).toBe('[rd]一个机灵的小伙计，手里拿着一块抹布。[/rd]');
    expect(result.data.target).toBe('npc/innkeeper#1');
    expect(result.data.long).toBe('一个机灵的小伙计，手里拿着一块抹布。');
  });

  it('look NPC 返回细粒度能力位', async () => {
    const room = new RoomBase('yangzhou/square');
    room.set('short', '广场');

    const player = new LivingBase('player#1');
    player.set('name', '张三');
    await player.moveTo(room, { quiet: true });

    const npc = new NpcBase('npc/elder#1');
    npc.set('name', '老者');
    npc.set('short', '白发老者');
    npc.set('inquiry', { default: '老者点了点头。' });
    await npc.moveTo(room, { quiet: true });

    const result = cmd.execute(player, ['老者']);

    expect(result.success).toBe(true);
    expect(result.data.target).toBe('npc');
    expect(result.data.capabilities).toEqual({
      chat: true,
      give: false,
      attack: true,
      shopList: false,
      shopSell: false,
      shop: false,
      quests: [],
    });
    expect(result.data.actions).toEqual(['chat', 'attack', 'close']);
  });

  it('look 商人 NPC 返回商店能力位', async () => {
    const room = new RoomBase('yangzhou/shop');
    room.set('short', '商铺');

    const player = new LivingBase('player#1');
    player.set('name', '张三');
    await player.moveTo(room, { quiet: true });

    const merchant = new MerchantBase('npc/merchant#1');
    merchant.set('name', '杂货商');
    merchant.set('shop_recycle', { enabled: false });
    await merchant.moveTo(room, { quiet: true });

    const result = cmd.execute(player, ['杂货商']);

    expect(result.success).toBe(true);
    expect(result.data.target).toBe('npc');
    expect(result.data.capabilities.shopList).toBe(true);
    expect(result.data.capabilities.shopSell).toBe(false);
    expect(result.data.capabilities.shop).toBe(true);
    expect(result.data.actions).toEqual(['shopList', 'attack', 'close']);
  });

  it('look 可授艺 NPC 返回查看技能动作与技能清单', async () => {
    const room = new RoomBase('songyang/yard');
    room.set('short', '弟子院');

    const player = new PlayerBase('player#1');
    player.set('name', '张三');
    await player.moveTo(room, { quiet: true });

    const npc = new NpcBase('npc/songyang/mentor-he#1');
    npc.set('name', '何教习');
    npc.set('short', '何教习');
    npc.set('teach_skills', ['songyang.entry.blade']);
    await npc.moveTo(room, { quiet: true });

    (ServiceLocator as any).skillRegistry = {
      get: jest.fn().mockReturnValue({
        skillId: 'songyang.entry.blade',
        skillName: '嵩阳入门刀',
        skillType: 'blade',
        category: 'martial',
      }),
    };

    const result = cmd.execute(player, ['何教习']);

    expect(result.success).toBe(true);
    expect(result.data.actions).toEqual(['attack', 'viewSkills', 'close']);
    expect(result.data.teachSkills).toEqual([
      {
        skillId: 'songyang.entry.blade',
        skillName: '嵩阳入门刀',
        skillType: 'blade',
        category: 'martial',
        level: 0,
        teachCost: 10,
      },
    ]);
  });

  it('look 玩家查看自己的师父时返回 learnSkill 动作', async () => {
    const room = new RoomBase('songyang/yard');
    room.set('short', '弟子院');

    const player = new PlayerBase('player#1');
    player.set('name', '张三');
    await player.moveTo(room, { quiet: true });

    const npc = new NpcBase('npc/songyang/mentor-he#1');
    npc.set('name', '何教习');
    npc.set('short', '何教习');
    npc.set('sect_id', 'songyang');
    npc.set('teach_skills', ['songyang.entry.blade']);
    await npc.moveTo(room, { quiet: true });

    (ServiceLocator as any).skillRegistry = {
      get: jest.fn().mockReturnValue({
        skillId: 'songyang.entry.blade',
        skillName: '嵩阳入门刀',
        skillType: 'blade',
        category: 'martial',
      }),
    };
    (ServiceLocator as any).sectManager = {
      getPlayerSectData: jest.fn().mockReturnValue({
        current: {
          sectId: 'songyang',
          masterNpcId: 'npc/songyang/mentor-he',
        },
      }),
      isSameSectWithNpc: jest.fn().mockReturnValue(true),
      getNpcAvailableActions: jest.fn().mockReturnValue([]),
    };

    const result = cmd.execute(player, ['何教习']);

    expect(result.success).toBe(true);
    expect(result.data.actions).toEqual(['attack', 'viewSkills', 'learnSkill', 'close']);
  });

  it('look 公共教习 NPC 返回 learnSkill 动作', async () => {
    const room = new RoomBase('rift-town/martial-hall');
    room.set('short', '武馆前堂');

    const player = new PlayerBase('player#1');
    player.set('name', '张三');
    await player.moveTo(room, { quiet: true });

    const npc = new NpcBase('npc/rift-town/martial-instructor#1');
    npc.set('name', '陈教头');
    npc.set('short', '陈教头');
    npc.set('can_public_teach', true);
    npc.set('teach_skills', ['novice.basic-blade']);
    await npc.moveTo(room, { quiet: true });

    (ServiceLocator as any).skillRegistry = {
      get: jest.fn().mockReturnValue({
        skillId: 'novice.basic-blade',
        skillName: '江湖基础刀法',
        skillType: 'blade',
        category: 'martial',
      }),
    };
    (ServiceLocator as any).sectManager = {
      getNpcAvailableActions: jest.fn().mockReturnValue([]),
    };

    const result = cmd.execute(player, ['陈教头']);

    expect(result.success).toBe(true);
    expect(result.data.actions).toEqual(['attack', 'viewSkills', 'learnSkill', 'close']);
  });

  it('look 门派 NPC 返回门派动作位', async () => {
    const room = new RoomBase('songyang/hall');
    room.set('short', '议事堂');

    const player = new PlayerBase('player#1');
    player.set('name', '张三');
    await player.moveTo(room, { quiet: true });

    const npc = new NpcBase('npc/songyang/master-li#1');
    npc.set('name', '李掌门');
    npc.set('short', '李掌门');
    npc.set('inquiry', { 拜师: '可。' });
    await npc.moveTo(room, { quiet: true });

    (ServiceLocator as any).sectManager = {
      getNpcAvailableActions: jest.fn().mockReturnValue(['apprentice', 'betray']),
    };

    const result = cmd.execute(player, ['李掌门']);

    expect(result.success).toBe(true);
    expect(result.data.capabilities.chat).toBe(true);
    expect(result.data.actions).toEqual(['chat', 'attack', 'apprentice', 'betray', 'close']);
  });

  it('look 住店 NPC 返回住店动作位', async () => {
    const room = new RoomBase('rift-town/inn');
    room.set('short', '安歇客栈');

    const player = new PlayerBase('player#1');
    player.set('name', '张三');
    await player.moveTo(room, { quiet: true });

    const npc = new NpcBase('npc/rift-town/waiter#1');
    npc.set('name', '店小二');
    npc.set('short', '店小二');
    npc.set('can_rent_room', true);
    await npc.moveTo(room, { quiet: true });

    const result = cmd.execute(player, ['店小二']);

    expect(result.success).toBe(true);
    expect(result.data.actions).toEqual(['attack', 'rent', 'close']);
  });

  it('look 打工 NPC 返回打工动作位', async () => {
    const room = new RoomBase('rift-town/academy');
    room.set('short', '书院讲堂');

    const player = new PlayerBase('player#1');
    player.set('name', '张三');
    await player.moveTo(room, { quiet: true });

    const npc = new NpcBase('npc/rift-town/academy-lecturer#1');
    npc.set('name', '温夫子');
    npc.set('short', '温夫子');
    await npc.moveTo(room, { quiet: true });

    (ServiceLocator as any).workManager = {
      getNpcAvailableActions: jest.fn().mockReturnValue(['work', 'workStop']),
    };

    const result = cmd.execute(player, ['温夫子']);

    expect(result.success).toBe(true);
    expect(result.data.actions).toEqual(['attack', 'work', 'workStop', 'close']);
  });

  it('不在环境中返回错误', () => {
    const player = new LivingBase('player#1');
    player.set('name', '张三');

    const result = cmd.execute(player, []);

    expect(result.success).toBe(false);
    expect(result.message).toContain('不在任何地方');
  });

  it('look 不存在的目标返回错误', async () => {
    const room = new RoomBase('yangzhou/inn');
    room.set('short', '客栈大堂');

    const player = new LivingBase('player#1');
    player.set('name', '张三');
    await player.moveTo(room, { quiet: true });

    const result = cmd.execute(player, ['龙王']);

    expect(result.success).toBe(false);
    expect(result.message).toContain('没有这个东西');
  });

  it('别名 l 和 看 通过 @Command 装饰器正确注册', () => {
    const meta = Reflect.getMetadata(COMMAND_META_KEY, LookCommand);

    expect(meta).toBeDefined();
    expect(meta.name).toBe('look');
    expect(meta.aliases).toContain('l');
    expect(meta.aliases).toContain('看');
    expect(meta.description).toBe('查看当前位置或指定对象');
  });
});
