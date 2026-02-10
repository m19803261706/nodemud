/**
 * 裂隙镇新手任务链测试
 *
 * 验证:
 * - 四段任务链前置关系正确
 * - 关键目标配置（交付/收集/击杀）正确
 * - 任务交付 NPC 只接收对应任务道具，避免误收卡任务
 */
import type { QuestDefinition } from '../quest/quest-definition';
import { LivingBase } from '../game-objects/living-base';
import { PlayerBase } from '../game-objects/player-base';
import { QuestManager } from '../quest/quest-manager';
import { QuestStatus } from '../quest/quest-definition';
import Blacksmith from '../../world/npc/rift-town/blacksmith';
import Herbalist from '../../world/npc/rift-town/herbalist';
import Bartender from '../../world/npc/rift-town/bartender';
import TownElder from '../../world/npc/rift-town/town-elder';
import BlacksmithLetter from '../../world/item/quest/blacksmith-letter';
import HerbalSachet from '../../world/item/quest/herbal-sachet';

describe('裂隙镇新手任务链', () => {
  let blacksmith: Blacksmith;
  let herbalist: Herbalist;
  let bartender: Bartender;
  let elder: TownElder;
  let giver: LivingBase;

  beforeEach(() => {
    blacksmith = new Blacksmith('npc/rift-town/blacksmith#spec');
    blacksmith.create();
    herbalist = new Herbalist('npc/rift-town/herbalist#spec');
    herbalist.create();
    bartender = new Bartender('npc/rift-town/bartender#spec');
    bartender.create();
    elder = new TownElder('npc/rift-town/town-elder#spec');
    elder.create();

    giver = new LivingBase('player/spec');
    giver.set('name', '测试玩家');
  });

  it('应配置完整的四段前置任务链', () => {
    const q1 = (blacksmith.get<QuestDefinition[]>('quests') ?? [])[0];
    const q2 = (herbalist.get<QuestDefinition[]>('quests') ?? [])[0];
    const q3 = (bartender.get<QuestDefinition[]>('quests') ?? [])[0];
    const q4 = (elder.get<QuestDefinition[]>('quests') ?? [])[0];

    expect(q1?.id).toBe('rift-town-novice-001');
    expect(q1?.turnInNpc).toBe('npc/rift-town/herbalist');
    expect(q1?.objectives[0]?.targetId).toBe('item/quest/blacksmith-letter');

    expect(q2?.id).toBe('rift-town-novice-002');
    expect(q2?.prerequisites?.completedQuests).toContain('rift-town-novice-001');
    expect(q2?.turnInNpc).toBe('npc/rift-town/bartender');
    expect(q2?.objectives[0]?.targetId).toBe('item/quest/herbal-sachet');

    expect(q3?.id).toBe('rift-town-novice-003');
    expect(q3?.prerequisites?.completedQuests).toContain('rift-town-novice-002');
    expect(q3?.objectives[0]?.targetId).toBe('item/rift-town/dry-rations');
    expect(q3?.objectives[0]?.count).toBe(2);

    expect(q4?.id).toBe('rift-town-novice-004');
    expect(q4?.prerequisites?.completedQuests).toContain('rift-town-novice-003');
    expect(q4?.objectives[0]?.targetId).toBe('npc/rift-town/bandit');
    expect(q4?.objectives[0]?.count).toBe(2);
  });

  it('药师与酒保应只接收各自对应的任务道具', () => {
    const letter = new BlacksmithLetter('item/quest/blacksmith-letter#spec');
    letter.create();
    const sachet = new HerbalSachet('item/quest/herbal-sachet#spec');
    sachet.create();

    expect(herbalist.onReceiveItem(giver, letter).accept).toBe(true);
    expect(herbalist.onReceiveItem(giver, sachet).accept).toBe(false);

    expect(bartender.onReceiveItem(giver, sachet).accept).toBe(true);
    expect(bartender.onReceiveItem(giver, letter).accept).toBe(false);
  });

  it('可交付状态应在交付 NPC 身上显示，且交付 NPC 不显示可接任务', () => {
    const questManager = new QuestManager();
    const player = new PlayerBase('player/quest-spec');
    player.set('name', '测试玩家');

    const q1 = (blacksmith.get<QuestDefinition[]>('quests') ?? [])[0];
    expect(q1).toBeDefined();
    questManager.registerQuest(q1!);

    // 未接任务时：发布者可见可接，交付者不可见可接
    const beforeGiver = questManager.getNpcQuestBriefs(player, 'npc/rift-town/blacksmith');
    const beforeTurnIn = questManager.getNpcQuestBriefs(player, 'npc/rift-town/herbalist');
    expect(beforeGiver.some((q) => q.questId === q1!.id && q.state === 'available')).toBe(true);
    expect(beforeTurnIn.some((q) => q.questId === q1!.id && q.state === 'available')).toBe(false);

    // 接受任务后，手动模拟已达成 READY
    const accept = questManager.acceptQuest(player, q1!.id, blacksmith);
    expect(accept.success).toBe(true);
    const questData = player.get<any>('quests');
    questData.active[q1!.id].status = QuestStatus.READY;
    player.set('quests', questData);

    // READY 应显示在交付 NPC（药师）身上
    const readyAtTurnIn = questManager.getNpcQuestBriefs(player, 'npc/rift-town/herbalist');
    expect(readyAtTurnIn.some((q) => q.questId === q1!.id && q.state === 'ready')).toBe(true);
  });

  it('把信件交给药师后应自动完成任务', () => {
    const questManager = new QuestManager();
    const player = new PlayerBase('player/quest-auto-complete');
    player.set('name', '测试玩家');

    const q1 = (blacksmith.get<QuestDefinition[]>('quests') ?? [])[0];
    expect(q1).toBeDefined();
    questManager.registerQuest(q1!);

    const accept = questManager.acceptQuest(player, q1!.id, blacksmith);
    expect(accept.success).toBe(true);

    const letter = new BlacksmithLetter('item/quest/blacksmith-letter#auto-complete');
    letter.create();

    const autoCompleteResults = questManager.onItemDelivered(herbalist, player, letter);
    expect(autoCompleteResults.some((r) => r.success)).toBe(true);

    const questData = player.get<any>('quests');
    expect(questData.active[q1!.id]).toBeUndefined();
    expect(questData.completed).toContain(q1!.id);
  });
});
