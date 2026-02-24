/**
 * 丝绸商秦娘 — 黄沙驿·丝绸铺
 * 从长安押货到西域的女商人，坚韧果敢
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class SilkMerchant extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '秦娘');
    this.set('short', '一个正在裁剪丝绸的中原女商人');
    this.set(
      'long',
      '她约莫三十来岁，面目清秀但神色刚毅，一看就是见过世面的人。' +
        '穿着中原式样的窄袖长衫，但料子是西域的驼绒混纺，实用胜过好看。' +
        '腰间别着一把裁剪用的剪刀和一柄短匕——前者用来做生意，后者用来保命。' +
        '据说她从长安一路押货到这里，路上遇过三次沙匪，' +
        '第一次赔了半车丝绸，第二次跑掉了，第三次亲手捅伤了一个。' +
        '她说话不紧不慢，但语气笃定，讲价时寸步不让，' +
        '但成交之后会送一块手帕大小的丝绸零头，算是添头。',
    );
    this.set('title', '');
    this.set('gender', 'female');
    this.set('faction', Factions.CHENG_TIAN);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 13);
    this.set('max_hp', 420);
    this.set('hp', 420);
    this.set('personality', 'determined');
    this.set('speech_style', 'calm');
    this.set('chat_chance', 30);
    this.set('chat_msg', [
      '秦娘把一匹丝绸展开，对着光线仔细查看，手指沿着布面轻轻滑过。',
      '秦娘正在记账，毛笔蘸了墨水在簿子上写得飞快。',
      '秦娘给一位西域买主裁下一段蜀绣，动作利落，剪刀咔嚓一声就齐了。',
      '秦娘用针线缝补一处被路上颠簸磨破的绸缎，针脚细密整齐。',
    ]);
    this.set('inquiry', {
      丝绸: '秦娘展开一匹素白绢：「这是杭州来的好绢，一两银子一尺。你在长安买，三两都不一定有。我在这儿卖便宜了——因为运费我已经吃进去了。」',
      丝路: '秦娘平静道：「从长安到这里，四十天。我走了七趟了。第一趟差点死在路上，后来就习惯了——人能习惯任何事，只要活着。」',
      长安: '秦娘眼中闪过一丝柔和：「长安好啊，繁华、热闹、什么都有。但我待不住——我这个人，停下来就不舒服，总想往远处走。」',
      default:
        '秦娘抬头看你一眼：「买丝绸？看看货色再说。我的东西不掺假，你自己摸摸手感就知道了。」',
    });
  }
}
