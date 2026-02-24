/**
 * 驼队商贩老马 — 丝路·废弃营地
 * 独行的西域商贩，跟骆驼打了半辈子交道，为人豪爽但精于算计
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class CamelTrader extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '老马');
    this.set('short', '一个牵着骆驼歇脚的商贩');
    this.set(
      'long',
      '他叫老马，但实际年龄可能只有四十出头，' +
        '只不过常年在大漠里风吹日晒，皮肤粗糙黝黑，看起来比实际年纪老了十来岁。' +
        '头上缠着一条褪色的靛蓝布巾，嘴唇干裂但总是带着笑。' +
        '身旁卧着一头老骆驼，驼峰上绑满了大大小小的包裹，' +
        '他不时拍拍骆驼的脖子，嘴里念叨着什么，像是在和老伙计说话。' +
        '据说他在这条丝路上来回走了二十多年，' +
        '哪里有水，哪里有匪，什么季节该走哪条路，他比谁都清楚。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 14);
    this.set('max_hp', 500);
    this.set('hp', 500);
    this.set('personality', 'honest');
    this.set('speech_style', 'merchant');
    this.set('chat_chance', 35);
    this.set('chat_msg', [
      '老马给骆驼喂了把干草，骆驼慢吞吞嚼着，发出满足的闷哼。',
      '老马从包袱里掏出一只水囊，喝了一小口，又仔细地塞回去，在沙漠里水比命金贵。',
      '老马用手搭在额前望了望天色，自言自语道：「今天没风，是赶路的好日子。」',
      '老马蹲在沙地上，用树枝画着什么，似乎是在计算到下一个驿站的距离。',
    ]);
    this.set('inquiry', {
      丝路: '老马道：「这条路我走了二十多年。年轻时觉得苦，现在嘛——」他拍了拍骆驼，「习惯了，就是家。」',
      强盗: '老马压低声音：「风蚀岩柱那一带要小心，强盗喜欢藏在石头后面。他们不敢动大商队，专挑落单的下手。走快些，别停。」',
      水源: '老马道：「绿洲废墟那口井早就干了，别指望。最近的活水在黄沙驿，忍着渴也得走到那儿。」',
      骆驼: '老马搂着骆驼的脖子笑道：「这是我第三头骆驼了，前两头老死在路上。这头叫黄毛，跟了我八年。人不可靠，骆驼可靠。」',
      default:
        '老马笑着招呼你：「独自走这条路？胆子不小。来，坐会儿歇歇脚，沙漠里遇见活人不容易，聊两句也好。」',
    });
  }
}
