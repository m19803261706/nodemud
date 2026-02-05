/**
 * 神秘旅人 — 裂隙镇断崖酒馆
 * 暗河组织成员，隐藏身份在镇上观察情报
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class MysteriousTraveler extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '神秘旅人');
    this.set('short', '一个黑衣蒙面的旅人');
    this.set(
      'long',
      '角落里坐着一个黑衣旅人，用一块深色面巾遮住了大半张脸，' +
        '只露出一双深邃而锐利的眼睛。他面前的酒杯几乎没怎么动过，' +
        '似乎来这里并不是为了喝酒。偶尔有人靠近，他便微微侧过身去，' +
        '浑身散发着一股拒人千里之外的气息。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.AN_HE);
    this.set('visible_faction', ''); // 暗河身份隐藏
    this.set('attitude', 'neutral');
    this.set('level', 30);
    this.set('max_hp', 1500);
    this.set('hp', 1500);
    this.set('chat_chance', 8);
    this.set('chat_msg', [
      '神秘旅人低头抿了一口酒，若有所思。',
      '神秘旅人的目光从窗口扫过，又收了回来。',
      '神秘旅人微微调整了一下坐姿，手始终没离开腰间。',
    ]);
    this.set('inquiry', {
      来历: '神秘旅人冷冷地看了你一眼：「与你无关。」',
      裂谷: '神秘旅人沉默片刻，低声说：「裂谷深处……有些东西，最好不要去碰。」',
      default: '神秘旅人没有理会你，继续盯着手中的酒杯出神。',
    });
    this.set('equipment', [
      { blueprintId: 'rift-town/dark-robe', position: 'body' },
      { blueprintId: 'rift-town/dark-gloves', position: 'hands' },
      { blueprintId: 'rift-town/dark-spike', position: 'weapon' },
    ]);
  }
}
