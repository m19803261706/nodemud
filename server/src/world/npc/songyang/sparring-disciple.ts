/**
 * 陪练弟子 — 嵩阳宗演武场
 * 门派职责：演武挑战
 */
import { Factions } from '@packages/core';
import { NpcBase } from '../../../engine/game-objects/npc-base';

export default class SongyangSparringDisciple extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '陪练弟子');
    this.set('short', '一名束发劲装的青年弟子');
    this.set(
      'long',
      '这名弟子步伐稳健，手上缠着旧布护腕，显然日日在场中打熬筋骨。你看得出他出手留有余地，却不失章法。',
    );
    this.set('title', '嵩阳宗');
    this.set('gender', 'male');
    this.set('faction', Factions.SONG_YANG);
    this.set('visible_faction', '嵩阳宗');
    this.set('attitude', 'friendly');
    this.set('level', 18);
    this.set('max_hp', 950);
    this.set('hp', 950);
    this.set('combat_exp', 1200);

    this.set('sect_id', 'songyang');
    this.set('sect_role', 'sparring');

    this.set('chat_chance', 12);
    this.set('chat_msg', [
      '陪练弟子抱拳站定，道：「师兄弟切磋，点到为止。」',
      '陪练弟子低喝一声，脚下连踏三步又收势。',
      '陪练弟子擦去额角汗水，继续练起基础桩法。',
    ]);

    this.set('inquiry', {
      演武: '陪练弟子笑道：「来吧，演武一场，咱们按规矩来。」',
      贡献: '陪练弟子道：「场上输赢都有所得，贵在守住心气。」',
      default: '陪练弟子抱拳道：「若要切磋，直说演武便是。」',
    });
  }
}
