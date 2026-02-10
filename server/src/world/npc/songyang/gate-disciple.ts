/**
 * 守山弟子 — 嵩阳宗山门值守
 * 门派职责：环境氛围与基础问询（本期无交互动作）
 */
import { Factions } from '@packages/core';
import { NpcBase } from '../../../engine/game-objects/npc-base';

export default class SongyangGateDisciple extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '守山弟子');
    this.set('short', '一名值守山门的年轻弟子');
    this.set(
      'long',
      '守山弟子背着长剑立在山门侧，眼神虽青涩却不散。你听得见他呼吸均匀，显然是按门中吐纳法在守值。',
    );
    this.set('title', '嵩阳宗');
    this.set('gender', 'male');
    this.set('faction', Factions.SONG_YANG);
    this.set('visible_faction', '嵩阳宗');
    this.set('attitude', 'neutral');
    this.set('level', 15);
    this.set('max_hp', 780);
    this.set('hp', 780);
    this.set('combat_exp', 900);

    this.set('sect_id', 'songyang');

    this.set('chat_chance', 14);
    this.set('chat_msg', [
      '守山弟子目视山道，低声复诵值守口令。',
      '守山弟子向你抱拳，道：「山门重地，请按规行事。」',
      '守山弟子抬手整了整剑穗，继续站定不动。',
    ]);

    this.set('inquiry', {
      门规: '守山弟子道：「入山先正衣冠，入门先正心念。」',
      去路: '守山弟子道：「北去议事堂，东去演武场，莫要乱闯。」',
      default: '守山弟子道：「在下只管守门，门中大事还请去堂上询问。」',
    });
  }
}
