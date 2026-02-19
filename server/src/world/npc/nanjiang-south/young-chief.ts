/**
 * 少寨主阿莽 — 雾岚寨·寨中空地
 * 雾岚寨少寨主，去过中原，性格开朗随性，对外来者比寨主更为包容
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class YoungChief extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '阿莽');
    this.set('short', '一个正在练刀的年轻苗族男子');
    this.set(
      'long',
      '二十出头的年纪，体格健壮，皮肤被山风晒得黝黑，' +
        '笑起来牙齿极白。身着简单的苗族布衣，没有过多银饰，只手腕上戴着两圈细银环。' +
        '腰间挂着一把苗刀，刀身弯曲，刀鞘上缠着彩绳，是亲手编的。' +
        '他和中原人打过交道，说话的方式比寨子里大多数族人更随和，' +
        '但骨子里仍有一种属于山里人的直接——喜欢就是喜欢，不喜欢也不藏着。' +
        '他是寨主银花的儿子，将来注定要继承寨主之位。',
    );
    this.set('title', '少寨主');
    this.set('gender', 'male');
    this.set('faction', Factions.BAI_MAN);
    this.set('visible_faction', '雾岚寨');
    this.set('attitude', 'friendly');
    this.set('level', 15);
    this.set('max_hp', 600);
    this.set('hp', 600);
    this.set('personality', 'friendly');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 50);
    this.set('chat_msg', [
      '阿莽对着树桩练刀，每一刀都带着利落的风声，练完抹了把汗，满脸不在乎地笑了。',
      '阿莽和几个族中兄弟说笑，用苗语吵吵嚷嚷，偶尔蹦出几个中原词汇，把自己人逗得哄笑。',
      '阿莽远眺山下，神情里有一种年轻人特有的、说不清道不明的心思。',
      '阿莽掏出一块干肉嚼着，冲你点了点头，算是打招呼。',
    ]);
    this.set('inquiry', {
      外面: '阿莽停下手里的事，语气里有点感慨：「我去过中原，那里的人……不一样。人多，事多，但很多人都不知道自己在忙什么。」他顿了顿，「我们这里少了很多东西，但至少知道自己活着是为什么。」',
      武学: '阿莽拔出腰间的苗刀，在阳光下转了一圈：「苗疆武学和汉人的不同，各有长短。你们的拳法讲究劲道内蓄，我们的刀法讲究以快打快。若要较量，倒可以切磋切磋。」',
      阿莽: '他嘿嘿一笑：「少寨主就是少寨主，叫阿莽也行，反正我不爱讲究那些。」',
      default: '阿莽朝你咧嘴一笑：「你是外面来的？坐，我给你倒碗酒，喝完再聊。」',
    });
  }
}
