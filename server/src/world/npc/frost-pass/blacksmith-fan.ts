/**
 * 铁匠范大锤 — 朔云关·军械库
 * 关城驻扎铁匠，性格粗憨，手艺精湛，专造边关特制兵甲
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class BlacksmithFan extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '范大锤');
    this.set('short', '一个肩膀极宽、满手老茧的铁匠');
    this.set(
      'long',
      '人如其名，身形如同铁塔，两只手臂比常人粗出一圈，' +
        '手背上布满了被炉火溅出的火星留下的细小疤痕。' +
        '总穿着一件皮围裙，上面烫满了焦孔，' +
        '脸上被炉火长年熏烤，肤色比北方人还要深。' +
        '他不喜欢话多的人，也不喜欢那些拿着花哨兵器来显摆的江湖客，' +
        '在他眼里，能杀人的才是好兵器，其余都是摆设。' +
        '他打的刀剑不好看，但极为耐用，从来没有一件在实战中断过。',
    );
    this.set('title', '关城铁匠');
    this.set('gender', 'male');
    this.set('faction', Factions.CHENG_TIAN);
    this.set('visible_faction', '承天朝');
    this.set('attitude', 'friendly');
    this.set('level', 15);
    this.set('max_hp', 500);
    this.set('hp', 500);
    this.set('personality', 'grumpy');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 50);
    this.set('chat_msg', [
      '范大锤抡起大锤，在铁砧上敲出一记震耳欲聋的响声，铁花四溅。',
      '范大锤斜眼打量某个路过的士兵手里的刀，嫌弃地哼了一声：「磨刀石是摆设？」',
      '范大锤擦了擦额头的汗，嘟囔道：「江湖上那些花活儿，上了战场一刀就断，废物。」',
    ]);
    this.set('inquiry', {
      打造: '范大锤转过身，用那双评估铁料的眼神看了看你：「打造要看材料和工期。普通铁件三天，精铁兵甲七天起。报价看东西，先把你要的说清楚。」',
      兵器: '范大锤瞥了一眼你的武器，不客气地说：「这玩意儿，拿来关外跟北漠人砍，两下就废了。边关的刀要厚、要重、要耐寒，江湖那套精巧的，没用。」',
      default: '范大锤头也不抬：「要修要打，放桌上。」',
    });
  }
}
