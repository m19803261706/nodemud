/**
 * 军需官周平 — 朔云关·军需库
 * 精明的军需官，账目清楚，为人圆滑，暗中与走私客有来往
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class SupplyOfficer extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '周平');
    this.set('short', '一个面容精瘦、手持账簿的军需官');
    this.set(
      'long',
      '四十出头，面颊消瘦，一双眼睛又细又亮，像是随时在计算什么。' +
        '穿着一件半新不旧的官服，领口扣得整整齐齐，' +
        '腰间挂着一串钥匙和一个算盘袋。' +
        '手里永远捧着一本厚厚的账簿，翻页的动作极快，' +
        '嘴里不时念叨着数字。' +
        '他说话客气但滴水不漏，从不轻易许诺什么，' +
        '却总能在缺这少那的时候变出一些物资来——' +
        '至于这些物资的来路，没人深究，也没人敢问。' +
        '据说关城上下，他是除了关令之外最了解物资底细的人。',
    );
    this.set('title', '军需官');
    this.set('gender', 'male');
    this.set('faction', Factions.CHENG_TIAN);
    this.set('visible_faction', '承天朝');
    this.set('attitude', 'friendly');
    this.set('level', 8);
    this.set('max_hp', 250);
    this.set('hp', 250);
    this.set('personality', 'cunning');
    this.set('speech_style', 'formal');
    this.set('chat_chance', 35);
    this.set('chat_msg', [
      '周平拨着算盘，眉头紧锁，嘴里嘟囔着：「又少了三十石粮……这账怎么对得上……」',
      '周平翻开账簿核对数目，满意地点点头，然后合上账簿锁进柜子里。',
      '周平走到粮袋前捏了捏，脸色微变，自言自语：「发霉了，得赶紧用掉。」',
    ]);
    this.set('inquiry', {
      物资: '周平合上账簿，微笑道：「关城物资紧张，这是明摆着的事。不过嘛，该有的还是有的。你若需要什么，列个单子给我，我看看库里还剩多少。价格嘛……边关物价，你也知道的，比南边贵些，但总比没有强。」',
      补给: '周平叹了口气，压低声音：「南边的补给已经三个月没到了，朝廷那边据说拨了款，但路上不知被哪个环节吃掉了。关城现在全靠存粮撑着，再有两个月，可就真难了。」他顿了顿，意味深长地看你一眼，「你要是路子广，帮忙带点东西进来，价格好商量。」',
      default: '周平笑了笑：「有事找我没问题，但得在账上说清楚。」',
    });
  }
}
