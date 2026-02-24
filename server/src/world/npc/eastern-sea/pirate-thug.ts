/**
 * 海盗喽啰 — 潮汐港·刀锋街
 * 散盟底层打手，好勇斗狠，以劫掠为生
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class PirateThug extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '海盗喽啰');
    this.set('short', '满脸横肉的海盗喽啰');
    this.set(
      'long',
      '这是个膀大腰圆的彪形大汉，光着上身露出满是刺青的胸膛，' +
        '刺的是一条张牙舞爪的海蛇，随着胸肌的起伏仿佛在游动。' +
        '他的脸上横着两道新旧交叠的伤疤，鼻子歪向一侧——' +
        '显然被人打断过，而且不止一次。' +
        '腰间插着一柄生锈的弯刀，刀柄上缠着的布条已经被汗水浸透。' +
        '他站在街边，眯着眼打量每一个经过的人，' +
        '那目光像是在掂量对方身上有多少值钱的东西。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.SAN_MENG);
    this.set('visible_faction', '东海·散盟');
    this.set('attitude', 'hostile');
    this.set('level', 16);
    this.set('max_hp', 600);
    this.set('hp', 600);
    this.set('combat_exp', 30);
    this.set('personality', 'aggressive');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 40);
    this.set('chat_msg', [
      '海盗喽啰拔出弯刀在石头上蹭了两下，发出刺耳的声响。',
      '海盗喽啰朝地上吐了口唾沫，用充满敌意的目光环顾四周。',
      '海盗喽啰摸着刺青嘿嘿直笑，像是在回忆什么"愉快"的经历。',
    ]);
    this.set('inquiry', {
      散盟: '海盗喽啰瞪着你：「散盟的事也是你能打听的？识趣的就交银子保平安，不识趣的——嘿嘿。」',
      default: '海盗喽啰上下打量你：「看什么看？想找事？」',
    });
  }
}
