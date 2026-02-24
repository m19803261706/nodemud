/**
 * 走私客陈铁舟 — 潮汐港·走私仓库
 * 经验丰富的走私贩，精通暗道与暗号
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class SmugglerChen extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '陈铁舟');
    this.set('short', '清点货物的走私客');
    this.set(
      'long',
      '陈铁舟是个三十出头的精干男人，身材不高但结实，' +
        '一双手臂因为常年搬运货物而筋骨分明。' +
        '他穿着一件深色短打，方便活动，腰间别着一柄匕首和一串钥匙。' +
        '他的眼神很冷静，不像海盗那样张扬凶悍，' +
        '更像是一个精密计算每一步的商人——只不过他的生意见不得光。' +
        '陈铁舟在潮汐港的地下通道里走得比老鼠还熟，' +
        '据说连霍三刀都不清楚那些密道的全部路线，' +
        '但陈铁舟闭着眼都能找到出口。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.SAN_MENG);
    this.set('visible_faction', '');
    this.set('attitude', 'neutral');
    this.set('level', 19);
    this.set('max_hp', 720);
    this.set('hp', 720);
    this.set('combat_exp', 0);
    this.set('personality', 'cautious');
    this.set('speech_style', 'formal');
    this.set('chat_chance', 25);
    this.set('chat_msg', [
      '陈铁舟低头核对一张货单，眉头微微皱起，似乎发现了什么不对。',
      '陈铁舟打开一个木箱检查了一下，满意地点了点头，合上盖子重新封蜡。',
      '陈铁舟将一串钥匙在手指间无声地转了一圈，眼神警觉地扫了扫四周。',
    ]);
    this.set('inquiry', {
      走私: '陈铁舟平静地看着你：「走私？这里没有走私。这里只有"特殊渠道的贸易"。你要买什么，说一声，价格好商量。」',
      密道: '陈铁舟面无表情：「什么密道？我只是在仓库清点货物。你要找路的话，从大门走。」',
      default: '陈铁舟淡淡地说：「仓库不对外开放，你是来提货还是送货？都不是的话，请离开。」',
    });
  }
}
