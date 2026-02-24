/**
 * 隐士无名 — 雾岚寨·飞瀑潭
 * 隐居在瀑布旁的武者，来历不明，偶尔指点后辈
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class WaterfallHermit extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '无名');
    this.set('short', '一个盘坐在潭边巨石上的赤膊男子');
    this.set(
      'long',
      '他赤着上身盘坐在瀑布旁的巨石上，水雾打在他身上，皮肤上全是细密的水珠。' +
        '身材精壮，筋骨分明，背上有几道陈年刀疤，已经泛白但痕迹清晰。' +
        '他的面容看不出年纪，可能四十，也可能更老——' +
        '只是一双眼睛异常平静，像面前的深潭一样，看不见底。' +
        '身旁放着一把没有剑鞘的短刀和一个打满补丁的布袋，除此之外别无长物。' +
        '没人知道他从哪里来，寨中人只知道他在这里住了至少五年，' +
        '从不进寨，也从不惹事，偶尔会用自己打的鱼换一些粮食。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 14);
    this.set('max_hp', 580);
    this.set('hp', 580);
    this.set('personality', 'philosophical');
    this.set('speech_style', 'scholarly');
    this.set('chat_chance', 10);
    this.set('chat_msg', [
      '无名闭目端坐，水雾打在身上，他纹丝不动，呼吸绵长而均匀。',
      '无名伸手入潭，水面纹丝不动。片刻后他收回手，掌心里多了一条活蹦乱跳的小鱼。',
      '无名望着飞瀑发了一会呆，然后轻轻呼出一口气，眼中有一闪而过的什么东西。',
    ]);
    this.set('inquiry', {
      武功: '无名看了你一眼，沉默了很久才开口：「刀有快慢，人有生死。你想学的到底是刀法，还是不怕死的胆子？」',
      来历: '无名摇了摇头：「来处不重要，去处也不重要。眼下坐在这里，听着水声，就够了。」',
      刀疤: '无名摸了摸背上的旧伤：「年轻时欠下的债。有些债用银子还，有些债用血还。都还完了。」他的语气很淡，像在说别人的事。',
      default: '无名抬了抬眼皮，又闭上了：「瀑布在响，你不必再添声音。」',
    });
  }
}
