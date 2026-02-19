/**
 * 渡船老七 — 烟雨镇·东码头
 * 散盟旗下的老船夫，跑东海水路三十年，知道许多不该知道的事
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class BoatmanLao extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '渡船老七');
    this.set('short', '停在船头的老船夫');
    this.set(
      'long',
      '老七体型魁梧，皮肤如风干的皮革，每一条皱纹里都藏着盐风与浪花。' +
        '他的手臂上布满了绳结磨出的老茧，握桨的姿势稳如磐石。' +
        '腰间别着一根竹哨，据说是出海时联络的信号。' +
        '三十年跑东海这条路，他见过无数人上船下船，' +
        '有些人去了就没再回来，他从不多问，但都记着。',
    );
    this.set('title', '老七船行 船夫');
    this.set('gender', 'male');
    this.set('faction', Factions.SAN_MENG);
    this.set('visible_faction', '老七船行');
    this.set('attitude', 'friendly');
    this.set('level', 14);
    this.set('max_hp', 600);
    this.set('hp', 600);
    this.set('combat_exp', 0);
    this.set('personality', 'friendly');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 45);
    this.set('chat_msg', [
      '老七弯腰检查船上的缆绳，每一处都仔细摸过，确认没有磨损。',
      '老七扯开嗓子吆喝：「要出海的快点上船，等下涨潮走不了！」',
      '老七靠在桅杆旁和水手闲聊，不时爆出粗犷的笑声。',
    ]);
    this.set('inquiry', {
      东海:
        '老七斜眼打量你一番，缓缓说：「出海？得看风向，老七跑了三十年这条水路，' +
        '什么暗礁、什么风口、哪段水路安全，哪段有人盯着，老七门儿清。要去哪说吧。」',
      散盟: '老七往旁边吐了口唾沫：「海上的事，知道太多也不好。你要出海，就跟我走。其他的别问。」',
      default:
        '老七粗声粗气地回应：「要出海的话上我的船，安全第一，价格公道，' +
        '废话少说，银子先付一半。」',
    });
  }
}
