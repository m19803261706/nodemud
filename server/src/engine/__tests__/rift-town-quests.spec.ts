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
});
