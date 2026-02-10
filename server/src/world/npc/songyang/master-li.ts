/**
 * 李掌门 — 嵩阳宗掌门
 * 门派职责：收徒 / 见证叛门
 */
import { Factions } from '@packages/core';
import { NpcBase } from '../../../engine/game-objects/npc-base';

export default class SongyangMasterLi extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '李掌门');
    this.set('short', '一位气息沉稳的中年剑者');
    this.set(
      'long',
      '李掌门立于堂前，衣袍简素，目光却如山涧寒泉。传言他年轻时走遍北境险地，归宗后只收心性稳重之人入门。',
    );
    this.set('title', '嵩阳宗');
    this.set('gender', 'male');
    this.set('faction', Factions.SONG_YANG);
    this.set('visible_faction', '嵩阳宗');
    this.set('attitude', 'friendly');
    this.set('level', 45);
    this.set('max_hp', 3200);
    this.set('hp', 3200);
    this.set('combat_exp', 6000);

    this.set('sect_id', 'songyang');
    this.set('sect_role', 'master');

    this.set('chat_chance', 8);
    this.set('chat_msg', [
      '李掌门缓缓道：「入门易，守心难。」',
      '李掌门目光掠过演武场，低声道：「刀剑先修人，再修招。」',
      '李掌门拂袖而立，似在默背门规。',
    ]);

    this.set('inquiry', {
      拜师: '李掌门道：「入门先过教习一关。去弟子院找何教习。」',
      门规: '李掌门道：「嵩阳重守正，先做人，再练刀。」',
      叛门: '李掌门道：「叛门者，自绝门墙，后果自担。」',
      default: '李掌门道：「心要静，路才看得远。」',
    });
  }
}
