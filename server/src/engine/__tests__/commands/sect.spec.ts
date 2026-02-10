import { ApprenticeCommand } from '../../commands/std/apprentice';
import { BetrayCommand } from '../../commands/std/betray';
import { DonateCommand } from '../../commands/std/donate';
import { SparCommand } from '../../commands/std/spar';
import { ItemBase } from '../../game-objects/item-base';
import { NpcBase } from '../../game-objects/npc-base';
import { PlayerBase } from '../../game-objects/player-base';
import { RoomBase } from '../../game-objects/room-base';
import { ServiceLocator } from '../../service-locator';

describe('门派指令', () => {
  let room: RoomBase;
  let player: PlayerBase;

  beforeEach(async () => {
    ServiceLocator.reset();
    room = new RoomBase('room/test-sect');
    player = new PlayerBase('player/test');
    player.set('name', '测试玩家');
    await player.moveTo(room, { quiet: true });
  });

  afterEach(() => {
    ServiceLocator.reset();
  });

  it('apprentice 指令应调用 sectManager.apprentice', async () => {
    const npc = new NpcBase('npc/songyang/master-li#1');
    npc.set('name', '李掌门');
    await npc.moveTo(room, { quiet: true });

    const apprentice = jest.fn().mockReturnValue({ success: true, message: 'ok' });
    (ServiceLocator as any).sectManager = { apprentice };

    const cmd = new ApprenticeCommand();
    const result = cmd.execute(player, ['李掌门']);

    expect(result.success).toBe(true);
    expect(apprentice).toHaveBeenCalledWith(player, npc);
  });

  it('donate 指令应按物品和 NPC 路由到 sectManager.donate', async () => {
    const npc = new NpcBase('npc/songyang/deacon-zhao#1');
    npc.set('name', '赵执事');
    await npc.moveTo(room, { quiet: true });

    const item = new ItemBase('item/test/ore');
    item.set('name', '精铁矿');
    await item.moveTo(player, { quiet: true });

    const donate = jest.fn().mockReturnValue({ success: true, message: 'ok' });
    (ServiceLocator as any).sectManager = { donate };

    const cmd = new DonateCommand();
    const result = cmd.execute(player, ['精铁矿', 'to', '赵执事']);

    expect(result.success).toBe(true);
    expect(donate).toHaveBeenCalledWith(player, npc, item);
  });

  it('spar 指令成功时应消耗次数并启动演武战斗', async () => {
    const npc = new NpcBase('npc/songyang/sparring-disciple#1');
    npc.set('name', '陪练弟子');
    await npc.moveTo(room, { quiet: true });

    const canStartSpar = jest.fn().mockReturnValue(true);
    const reserveSparAttempt = jest.fn();
    const startSparCombat = jest.fn();
    (ServiceLocator as any).sectManager = { canStartSpar, reserveSparAttempt };
    (ServiceLocator as any).combatManager = { startSparCombat };

    const cmd = new SparCommand();
    const result = cmd.execute(player, ['陪练弟子']);

    expect(result.success).toBe(true);
    expect(canStartSpar).toHaveBeenCalledWith(player, npc);
    expect(reserveSparAttempt).toHaveBeenCalledWith(player);
    expect(startSparCombat).toHaveBeenCalledWith(player, npc);
  });

  it('spar 指令失败时不应启动战斗', async () => {
    const npc = new NpcBase('npc/songyang/sparring-disciple#1');
    npc.set('name', '陪练弟子');
    await npc.moveTo(room, { quiet: true });

    const canStartSpar = jest.fn().mockReturnValue('你今日演武已满一次，且回去温养气息。');
    const reserveSparAttempt = jest.fn();
    const startSparCombat = jest.fn();
    (ServiceLocator as any).sectManager = { canStartSpar, reserveSparAttempt };
    (ServiceLocator as any).combatManager = { startSparCombat };

    const cmd = new SparCommand();
    const result = cmd.execute(player, ['陪练弟子']);

    expect(result.success).toBe(false);
    expect(result.message).toContain('今日演武已满一次');
    expect(reserveSparAttempt).not.toHaveBeenCalled();
    expect(startSparCombat).not.toHaveBeenCalled();
  });

  it('betray 指令应调用 sectManager.betray', async () => {
    const npc = new NpcBase('npc/songyang/deacon-zhao#1');
    npc.set('name', '赵执事');
    await npc.moveTo(room, { quiet: true });

    const betray = jest.fn().mockReturnValue({ success: true, message: 'ok' });
    (ServiceLocator as any).sectManager = { betray };

    const cmd = new BetrayCommand();
    const result = cmd.execute(player, ['赵执事']);

    expect(result.success).toBe(true);
    expect(betray).toHaveBeenCalledWith(player, npc);
  });
});
