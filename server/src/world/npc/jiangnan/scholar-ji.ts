/**
 * 落魄书生纪无白 — 烟雨镇·运河街
 * 曾是江南名士，因某件往事落魄至此，借酒度日
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class ScholarJi extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '纪无白');
    this.set('short', '靠在树根旁的落魄书生');
    this.set(
      'long',
      '纪无白一身洗旧了的青衫，衣领处有一块墨迹，' +
        '大概是某次醉后提笔时不小心留下的，已经洗了无数次也没洗干净。' +
        '他眉宇间残存着一丝昔日书卷气，却被岁月和酒气蒙上了一层灰。' +
        '手中永远捏着一壶酒，价格最廉的那种，' +
        '据说当年他可是能写出让人传诵的好诗的人。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 5);
    this.set('max_hp', 200);
    this.set('hp', 200);
    this.set('combat_exp', 0);
    this.set('personality', 'timid');
    this.set('speech_style', 'scholarly');
    this.set('chat_chance', 60);
    this.set('chat_msg', [
      '纪无白仰头饮了一口浊酒，闭目吟诵几句已半忘的旧词。',
      '纪无白长叹一声，望着运河发呆，不知在想些什么。',
      '纪无白低声念叨着昔日种种，声音里有说不清是悔恨还是怀念的情绪。',
      '纪无白摇晃着酒壶，发现已经见底，神情一时更加落寞。',
    ]);
    this.set('inquiry', {
      商帮: '纪无白喝了口酒，眼神飘忽，压低声音：「江南商帮里有几个黑心人……某次收购的内情，若你诚心，我可以告诉你一桩秘事。」',
      往事: '纪无白苦笑一声，将数年前的一段江南秘闻娓娓道来，语气里夹着感慨与怅然。',
      default: '纪无白抬起惺忪的眼皮：「唉，又是一壶浊酒度残春…你也是无处可去的人吗？」',
    });
  }
}
