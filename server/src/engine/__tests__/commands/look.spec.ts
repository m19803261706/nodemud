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
import { COMMAND_META_KEY } from '../../types/command';

describe('LookCommand', () => {
  let cmd: LookCommand;

  beforeEach(() => {
    cmd = new LookCommand();
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
