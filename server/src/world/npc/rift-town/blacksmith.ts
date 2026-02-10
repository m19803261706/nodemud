/**
 * 老周铁匠 — 裂隙镇铁匠铺
 * 承天朝退役军匠，手艺精湛
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions, rt } from '@packages/core';
import {
  type QuestDefinition,
  QuestType,
  ObjectiveType,
} from '../../../engine/quest/quest-definition';

export default class Blacksmith extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '老周铁匠');
    this.set('short', '一个身材魁梧的壮年铁匠');
    this.set(
      'long',
      '铁匠铺里热浪滚滚，一个膀大腰圆的壮年汉子正挥锤锻铁，' +
        '火星四溅。他叫老周，虽然才四十出头，但镇上人都这么叫他。' +
        '他的左臂有一道长长的旧疤，据说是当年在承天朝军中留下的。' +
        '退役后他来到裂隙镇开了这间铁匠铺，打造的刀剑虽不如名家，' +
        '但结实耐用，在镇上口碑极好。',
    );
    this.set('title', '裂隙镇');
    this.set('gender', 'male');
    this.set('faction', Factions.CHENG_TIAN);
    this.set('visible_faction', '承天朝');
    this.set('attitude', 'friendly');
    this.set('level', 25);
    this.set('max_hp', 1200);
    this.set('hp', 1200);
    this.set('chat_chance', 10);
    this.set('chat_msg', [
      '老周铁匠叮叮当当地敲打着铁砧上的红铁。',
      '老周铁匠将一把刚打好的刀放进水桶里，滋——地一声白气升腾。',
      '老周铁匠擦了擦额头上的汗珠，喝了口水。',
    ]);
    this.set('inquiry', {
      武器: '老周铁匠放下铁锤，爽朗地笑道：「要买兵器？咱这小铺子没什么神兵利器，但打出来的家伙事儿，结实！砍上几百刀都不卷刃。」',
      承天朝:
        '老周铁匠摸了摸左臂的旧疤：「承天朝嘛，在那当了十年军匠。后来受了伤，就退下来了。朝廷的事，咱管不了那么多，能踏踏实实打铁就行。」',
      铠甲: '老周铁匠拍了拍胸脯：「铠甲也能打，不过费时费料。你要是真想要，先交定金，我给你量身打一副。」',
      default: '老周铁匠摆摆手：「这事儿我不懂，你去问别人吧。我就是个打铁的。」',
    });
    this.set('combat_exp', 120);
    this.set('equipment', [
      { blueprintId: 'item/rift-town/smith-apron', position: 'body' },
      { blueprintId: 'item/rift-town/smith-gloves', position: 'hands' },
      { blueprintId: 'item/rift-town/smith-hammer', position: 'weapon' },
    ]);

    // 新手主线任务 1：炉火急信（deliver）
    const questDefs: QuestDefinition[] = [
      {
        id: 'rift-town-novice-001',
        name: '炉火急信',
        description: '老周铁匠托你把密封信件送到药铺，务必亲手交给白发药师。',
        type: QuestType.DELIVER,
        giverNpc: 'npc/rift-town/blacksmith',
        turnInNpc: 'npc/rift-town/herbalist',
        objectives: [
          {
            type: ObjectiveType.DELIVER,
            targetId: 'item/quest/blacksmith-letter',
            count: 1,
            description: '将「铁匠的信」交给白发药师',
          },
        ],
        rewards: {
          exp: 140,
          silver: 20,
          potential: 15,
          score: 8,
          items: [{ blueprintId: 'item/rift-town/golden-salve', count: 1 }],
        },
        giveItems: [{ blueprintId: 'item/quest/blacksmith-letter', count: 1 }],
        flavorText: {
          onAccept:
            `${rt('npc', '老周铁匠')}把油纸信往你怀里一塞：「跑快点，` +
            `药铺那位刀子嘴豆腐心，别让她久等。」`,
          onReady:
            `${rt('npc', '白发药师')}已经收下了信。` +
            `${rt('sys', '你可以当面交付任务。')}`,
          onComplete:
            `${rt('npc', '白发药师')}低声道：「炉火能炼铁，也能炼人心。` +
            `你脚下这条路，先把该做的小事做好，江湖才会给你大门。」`,
        },
      },
    ];
    this.set('quests', questDefs);
  }
}
