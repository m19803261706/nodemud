/**
 * 寨主苗母银花 — 雾岚寨·寨中空地
 * 雾岚寨寨主，苗疆女性权威，严肃而深沉，对外人保持高度警惕
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class BaimanvillageElder extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '银花');
    this.set('short', '一位身着华美苗服的中年女子');
    this.set(
      'long',
      '她年约五旬，但面容保养得宜，眼角的纹路让她看起来更多了一种沉稳的威严。' +
        '身着繁复的苗族盛装，银饰从颈项垂落，叮当作响，' +
        '每一件饰品都是寨主身份的象征，也是家族传承的见证。' +
        '腰间挂着一只古朴的蛊壶，壶身刻着看不懂的纹样，她时而抚摸壶身，那是习惯性的动作。' +
        '她的眼神平静如深潭，审视每一个陌生来客，不带任何多余的情绪，' +
        '但眼底有某种难以言说的东西——是见过太多之后的疲倦，还是守护一族之人的重量？',
    );
    this.set('title', '寨主');
    this.set('gender', 'female');
    this.set('faction', Factions.BAI_MAN);
    this.set('visible_faction', '雾岚寨');
    this.set('attitude', 'friendly');
    this.set('level', 25);
    this.set('max_hp', 1200);
    this.set('hp', 1200);
    this.set('personality', 'stern');
    this.set('speech_style', 'formal');
    this.set('chat_chance', 30);
    this.set('chat_msg', [
      '银花目光如炬，将来客从头到脚审视一遍，不动声色。',
      '银花低声吩咐身旁的族人，苗语如流水，外人听不懂说了什么。',
      '银花缓缓抚摸腰间的蛊壶，指尖沿着壶身的纹路描摹，神思似乎飘向远处。',
      '银花望着篝火，沉默良久，才回过神来，收回视线。',
    ]);
    this.set('inquiry', {
      蛊术: '银花垂眸，声音平静而不容置疑：「蛊之道，非外人所能轻学。你有这份心，先证明你值得信任。」',
      部落: '银花略抬下巴：「雾岚寨世代守护此山，这山里的一草一木都是我族子民的命脉。」',
      银花: '她淡淡地看你一眼：「寨主便是寨主，没有什么可多说的。」',
      default: '银花静静看着你，片刻后开口，声音里带着一种由来已久的沉稳：「外人，你来此何事？」',
    });
  }
}
