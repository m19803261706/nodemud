/**
 * 裂隙镇新手任务链测试
 *
 * 验证:
 * - 六段任务链前置关系正确（001→002→003→005→006→004）
 * - 关键目标配置（交付/收集/对话/击杀）正确
 * - 任务交付 NPC 只接收对应任务道具，避免误收卡任务
 * - TALK 目标追踪与 rewardSkills 技能奖励
 */
import type { QuestDefinition } from '../quest/quest-definition';
import { ObjectiveType } from '../quest/quest-definition';
import { LivingBase } from '../game-objects/living-base';
import { PlayerBase } from '../game-objects/player-base';
import { QuestManager } from '../quest/quest-manager';
import { QuestStatus } from '../quest/quest-definition';
import Blacksmith from '../../world/npc/rift-town/blacksmith';
import Herbalist from '../../world/npc/rift-town/herbalist';
import Bartender from '../../world/npc/rift-town/bartender';
import TownElder from '../../world/npc/rift-town/town-elder';
import AcademyLecturer from '../../world/npc/rift-town/academy-lecturer';
import MartialInstructor from '../../world/npc/rift-town/martial-instructor';
import BlacksmithLetter from '../../world/item/quest/blacksmith-letter';
import HerbalSachet from '../../world/item/quest/herbal-sachet';
import { NOVICE_SKILL_IDS } from '../skills/novice/novice-skill-ids';

describe('裂隙镇新手任务链', () => {
  let blacksmith: Blacksmith;
  let herbalist: Herbalist;
  let bartender: Bartender;
  let elder: TownElder;
  let lecturer: AcademyLecturer;
  let instructor: MartialInstructor;
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
    lecturer = new AcademyLecturer('npc/rift-town/academy-lecturer#spec');
    lecturer.create();
    instructor = new MartialInstructor('npc/rift-town/martial-instructor#spec');
    instructor.create();

    giver = new LivingBase('player/spec');
    giver.set('name', '测试玩家');
  });

  it('应配置完整的六段前置任务链 (001→002→003→005→006→004)', () => {
    const q1 = (blacksmith.get<QuestDefinition[]>('quests') ?? [])[0];
    const q2 = (herbalist.get<QuestDefinition[]>('quests') ?? [])[0];
    const q3 = (bartender.get<QuestDefinition[]>('quests') ?? [])[0];
    const q5 = (lecturer.get<QuestDefinition[]>('quests') ?? [])[0];
    const q6 = (instructor.get<QuestDefinition[]>('quests') ?? [])[0];
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

    // 技能学习引导 005: 学内功
    expect(q5?.id).toBe('rift-town-novice-005');
    expect(q5?.prerequisites?.completedQuests).toContain('rift-town-novice-003');
    expect(q5?.objectives[0]?.type).toBe(ObjectiveType.TALK);
    expect(q5?.objectives[0]?.targetId).toBe('npc/rift-town/academy-lecturer');
    expect(q5?.rewards?.rewardSkills).toContain(NOVICE_SKILL_IDS.BASIC_FORCE);

    // 技能学习引导 006: 学外功
    expect(q6?.id).toBe('rift-town-novice-006');
    expect(q6?.prerequisites?.completedQuests).toContain('rift-town-novice-005');
    expect(q6?.objectives[0]?.type).toBe(ObjectiveType.TALK);
    expect(q6?.objectives[0]?.targetId).toBe('npc/rift-town/martial-instructor');
    expect(q6?.rewards?.rewardSkills).toContain(NOVICE_SKILL_IDS.BASIC_BLADE);
    expect(q6?.rewards?.rewardSkills).toContain(NOVICE_SKILL_IDS.BASIC_DODGE);
    expect(q6?.rewards?.rewardSkills).toContain(NOVICE_SKILL_IDS.BASIC_PARRY);

    // 004 现在依赖 006 而不是 003
    expect(q4?.id).toBe('rift-town-novice-004');
    expect(q4?.prerequisites?.completedQuests).toContain('rift-town-novice-006');
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

  it('TALK 目标在接受任务时如果 giverNpc == targetId 应立即完成', () => {
    const questManager = new QuestManager();
    const player = new PlayerBase('player/talk-test');
    player.set('name', '测试玩家');

    const q5 = (lecturer.get<QuestDefinition[]>('quests') ?? [])[0];
    expect(q5).toBeDefined();
    questManager.registerQuest(q5!);

    // 模拟已完成前置任务 003
    player.set('quests', { active: {}, completed: ['rift-town-novice-003'] });

    const accept = questManager.acceptQuest(player, q5!.id, lecturer);
    expect(accept.success).toBe(true);

    // 接受后 TALK 目标应已完成（giverNpc == targetId）
    const questData = player.get<any>('quests');
    const progress = questData.active[q5!.id];
    expect(progress.status).toBe(QuestStatus.READY);
    expect(progress.objectives[0]).toBe(1);
  });

  it('onNpcTalked 应推进 TALK 目标', () => {
    const questManager = new QuestManager();
    const player = new PlayerBase('player/npc-talk-test');
    player.set('name', '测试玩家');

    // 注册一个 TALK 任务，但 targetId 不是 giverNpc（人为构造场景）
    const customQuest: QuestDefinition = {
      id: 'test-talk-quest',
      name: '测试对话任务',
      description: '测试',
      type: 'dialogue' as any,
      giverNpc: 'npc/test/giver',
      objectives: [
        {
          type: ObjectiveType.TALK,
          targetId: 'npc/test/target',
          count: 1,
          description: '与目标 NPC 对话',
        },
      ],
      rewards: { exp: 10 },
    };
    questManager.registerQuest(customQuest);

    // 模拟接受任务（需要手动设置任务数据）
    player.set('quests', {
      active: {
        'test-talk-quest': {
          questId: 'test-talk-quest',
          status: QuestStatus.ACTIVE,
          objectives: { 0: 0 },
          acceptedAt: Date.now(),
        },
      },
      completed: [],
    });

    // 和无关 NPC 对话不应推进
    questManager.onNpcTalked(player, 'npc/test/other');
    let data = player.get<any>('quests');
    expect(data.active['test-talk-quest'].objectives[0]).toBe(0);

    // 和目标 NPC 对话应推进
    questManager.onNpcTalked(player, 'npc/test/target');
    data = player.get<any>('quests');
    expect(data.active['test-talk-quest'].objectives[0]).toBe(1);
    expect(data.active['test-talk-quest'].status).toBe(QuestStatus.READY);
  });
});
