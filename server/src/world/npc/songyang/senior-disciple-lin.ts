/**
 * 林师兄 — 嵩阳宗首席弟子
 * 门派职责：演武挑战
 */
import { Factions } from '@packages/core';
import { NpcBase } from '../../../engine/game-objects/npc-base';

export default class SongyangSeniorDiscipleLin extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '林师兄');
    this.set('short', '一位肩宽背阔的青衣弟子');
    this.set(
      'long',
      '林师兄掌背有旧茧，举手投足都带着打熬多年的劲道。听说他出身寒门，却在门中靠一口气爬上首席位置。',
    );
    this.set('title', '嵩阳宗 首席弟子');
    this.set('gender', 'male');
    this.set('faction', Factions.SONG_YANG);
    this.set('visible_faction', '嵩阳宗');
    this.set('attitude', 'friendly');
    this.set('level', 26);
    this.set('max_hp', 1500);
    this.set('hp', 1500);
    this.set('combat_exp', 2200);

    this.set('sect_id', 'songyang');
    this.set('sect_role', 'sparring');

    this.set('chat_chance', 12);
    this.set('chat_msg', [
      '林师兄笑道：「演武场上，先礼后招。」',
      '林师兄一招收势，衣袖无风自停。',
      '林师兄低声提醒身旁弟子：「脚下稳，手上才不乱。」',
    ]);

    this.set('inquiry', {
      演武: '林师兄道：「来，咱们按规矩切磋一场。」',
      贡献: '林师兄道：「门中看你走多远，不只看你赢多少。」',
      default: '林师兄道：「江湖路长，先把一招一式走稳。」',
    });
  }
}
