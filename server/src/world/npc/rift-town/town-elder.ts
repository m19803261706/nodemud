/**
 * 老镇长 — 裂隙镇镇中广场
 * 裂隙镇的管理者，德高望重的老人，了解镇上的一切
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions, rt } from '@packages/core';
import {
  type QuestDefinition,
  QuestType,
  ObjectiveType,
} from '../../../engine/quest/quest-definition';

export default class TownElder extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '老镇长');
    this.set('short', '一位须发皆白的老者');
    this.set(
      'long',
      '老镇长年过七旬，须发皆白却精神矍铄。他拄着一根不知年岁的黑木拐杖，' +
        '浑浊的双眼中却透着洞察世事的光芒。他在裂隙镇住了一辈子，' +
        '亲眼见证了天裂之变将原本平静的山谷撕成了如今的裂谷，' +
        '也见证了各方势力在此交汇的数十年风云。',
    );
    this.set('title', '裂隙镇');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 20);
    this.set('max_hp', 800);
    this.set('hp', 800);
    this.set('chat_chance', 10);
    this.set('chat_msg', [
      '老镇长捋了捋花白的胡须，目光远眺裂谷方向。',
      '老镇长轻叹一声，拄着拐杖踱了几步。',
      '老镇长朝路过的镇民和蔼地点了点头。',
    ]);
    this.set('inquiry', {
      裂隙镇:
        '老镇长慢悠悠地说：「裂隙镇啊，原本只是个寻常山谷里的小村庄。五十年前那场天裂，大地撕开一道深谷，我们就在裂谷边上重建了这个小镇。如今南来北往的人多了，倒也热闹了不少。」',
      天裂: '老镇长神色凝重：「天裂之变，是五十年前的事了。那一夜天空好像被撕开一道口子，大地震颤不止，整个山谷裂成了深不见底的裂谷。死了不少人啊……至今裂谷深处还时不时传出奇怪的响动。」',
      势力: '老镇长摇了摇头：「承天朝的兵、嵩阳宗的弟子、东海散盟的商人……这些年什么人都来过。裂隙镇是中立之地，我们不站队，谁来了都欢迎，但谁也别想在这儿闹事。」',
      盗匪: '老镇长叹了口气：「北道上最近来了些不三不四的家伙，劫掠过往行人。我已经让卫兵加强巡逻了，但人手实在不够。你若是有本事，帮忙清理一下最好不过。」',
      default: '老镇长笑了笑：「老朽年纪大了，记性不好啦。你四处走走问问别人吧。」',
    });

    // 新手主线终章：裂谷北道清剿
    const questDefs: QuestDefinition[] = [
      {
        id: 'rift-town-novice-004',
        name: '北道试锋',
        description: '老镇长请你清剿北道盗匪，让来往商旅敢走夜路。',
        type: QuestType.CAPTURE,
        giverNpc: 'npc/rift-town/town-elder',
        prerequisites: { completedQuests: ['rift-town-novice-003'] },
        objectives: [
          {
            type: ObjectiveType.KILL,
            targetId: 'npc/rift-town/bandit',
            count: 2,
            description: '击杀裂谷北道盗匪 2 名',
          },
        ],
        rewards: {
          exp: 320,
          silver: 46,
          potential: 55,
          score: 20,
          items: [
            { blueprintId: 'item/rift-town/short-knife', count: 1 },
            { blueprintId: 'item/rift-town/golden-salve', count: 1 },
          ],
        },
        flavorText: {
          onAccept:
            `${rt('npc', '老镇长')}拄杖望北，声音不高却有力：` +
            '「侠字不在嘴上，在脚下。去北道走一遭，把那几股匪患压下去。」',
          onReady:
            `${rt('sys', '北道盗匪已被震慑，回镇中广场向老镇长复命。')}`,
          onComplete:
            `${rt('npc', '老镇长')}轻叹道：「江湖从不缺刀，缺的是肯替旁人挡刀的人。` +
            `记住今日这口气，往后路越远，心越要稳。」`,
        },
      },
    ];
    this.set('quests', questDefs);
  }
}
