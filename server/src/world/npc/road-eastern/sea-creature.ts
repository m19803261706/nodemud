/**
 * 礁石蟹 — 海路·礁石道
 * 退潮礁石道上的大型蟹类，凶猛好斗
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class SeaCreature extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '礁石蟹');
    this.set('short', '一只横行礁石道的巨蟹');
    this.set(
      'long',
      '这只礁石蟹比寻常螃蟹大了数倍，甲壳呈黑灰色，' +
        '表面覆着厚厚的石灰质纹路，像是礁石本身的一部分。' +
        '两只巨螯足有人的前臂那么长，钳力惊人，' +
        '据说能钳断手腕粗的木料。' +
        '它的眼睛长在细细的眼柄上，能看到几乎所有方向，' +
        '一旦感知到侵入领地的威胁，便会毫不犹豫地挥起大螯出击。',
    );
    this.set('title', '');
    this.set('gender', 'none');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 12);
    this.set('max_hp', 350);
    this.set('hp', 350);
    this.set('combat_exp', 85);
    this.set('personality', 'grumpy');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 3);
    this.set('chat_msg', [
      '礁石蟹高举双螯，左右横晃，发出威慑性的嘶嘶声。',
      '礁石蟹在礁石间横行，八条腿踩在湿滑岩面上却稳如生根。',
    ]);
    this.set('inquiry', {
      default: '礁石蟹对你的话毫无反应，只是更用力地挥舞起大螯。',
    });
  }
}
