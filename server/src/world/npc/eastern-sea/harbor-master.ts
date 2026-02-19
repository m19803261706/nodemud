/**
 * 港主霍三刀 — 潮汐港·鱼市广场
 * 潮汐港的实际掌控者，散盟的地头蛇，手段强硬
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class HarborMaster extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '霍三刀');
    this.set('short', '在广场数银票的港主');
    this.set(
      'long',
      '霍三刀是个五十出头的壮实汉子，脸上一道从眉头劈到颧骨的旧疤，' +
        '据说是年轻时在东海拼船留下的。' +
        '他穿着一件厚实的深褐色皮袄，腰间挂着三把形制各异的刀——' +
        '左边短，右边弯，背后宽，这就是他绰号的由来。' +
        '在潮汐港，他说一不二。没有人敢在他面前说"不"字。',
    );
    this.set('title', '潮汐港 港主');
    this.set('gender', 'male');
    this.set('faction', Factions.SAN_MENG);
    this.set('visible_faction', '潮汐港');
    this.set('attitude', 'friendly');
    this.set('level', 25);
    this.set('max_hp', 1200);
    this.set('hp', 1200);
    this.set('combat_exp', 0);
    this.set('personality', 'cunning');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 35);
    this.set('chat_msg', [
      '霍三刀慢条斯理地数着手中的银票，每一张都仔细看了又看。',
      '霍三刀低声吩咐身旁的手下，手下立刻点头退下，动作利落。',
      '霍三刀冷笑一声，眼神从某个角落扫过，那角落里的人立刻低下了头。',
    ]);
    this.set('inquiry', {
      规矩: '霍三刀把玩着手中的银票，不紧不慢地说：「潮汐港就一条规矩：有钱好办事。没钱？那就看老子心情了。」',
      散盟:
        '霍三刀斜眼看你：「散盟？那是海上的事。港里的事，我说了算。' +
        '你要打听散盟，最好先让我看看你的诚意——银子的诚意。」',
      default: '霍三刀抬眼打量你一番：「新来的？先交份例钱，规矩懂吧？」',
    });
  }
}
