/**
 * 情报贩子夜鸮 — 黄沙驿·奇物铺
 * 身份不明的情报商人，消息灵通，价格不菲
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class InfoBroker extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '夜鸮');
    this.set('short', '一个裹着面巾的人，只露出一双深邃的眼睛');
    this.set(
      'long',
      '此人从头到脚裹在灰色的袍子里，面巾遮住了大半张脸，' +
        '只露出一双幽深的眼睛，性别和年龄都无从分辨。' +
        '声音低沉，刻意压着，像是怕被隔墙的人听去。' +
        '手指修长而苍白，偶尔从袍袖中伸出来，在桌面上轻轻叩击，' +
        '似乎在数拍子，又像是某种暗号。' +
        '丝路上的人叫这个人「夜鸮」，据说什么消息都能从这里买到——' +
        '商路上的匪情、各国朝廷的变动、某个武林门派的秘事——' +
        '只要出得起价，没有买不到的消息。但从来没人知道消息的来源是什么。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'neutral');
    this.set('level', 18);
    this.set('max_hp', 700);
    this.set('hp', 700);
    this.set('personality', 'secretive');
    this.set('speech_style', 'cryptic');
    this.set('chat_chance', 15);
    this.set('chat_msg', [
      '夜鸮在暗处坐着不动，只有眼睛偶尔闪烁一下，像猫头鹰在夜里。',
      '夜鸮的手指在桌面上无声地敲击着，节奏不规则，像是某种只有自己能懂的密码。',
      '夜鸮轻轻翻动着一本薄薄的册子，翻页的动作极快，似乎在找什么。',
    ]);
    this.set('inquiry', {
      情报: '夜鸮微微倾身，声音压得更低：「你想知道什么？路上的匪情、某人的下落、还是更隐秘的事？」停了一拍，「先说价。」',
      价格: '夜鸮伸出三根手指：「消息分三等。路上的事，小钱。人的事，中钱。天下的事，大钱。至于大钱是多少——取决于你想知道什么。」',
      身份: '夜鸮眼中掠过一丝笑意：「我是谁不重要。重要的是我知道你想知道的东西。你是买还是不买？」',
      default: '夜鸮注视着你，半晌，低声道：「你来找我，说明你需要知道些什么。坐下谈。」',
    });
  }
}
