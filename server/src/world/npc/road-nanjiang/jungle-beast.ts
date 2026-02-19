/**
 * 林中猛兽 — 山路·蛮疆段
 * 蛮疆山林中的大型野兽，中级敌对野怪
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class JungleBeast extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '林中猛兽');
    this.set('short', '一头在林间穿行的大型野兽');
    this.set(
      'long',
      '一头体型壮硕的野兽，全身覆盖着灰褐色的短毛，' +
        '肩高约有成年人的腰部，四肢粗壮，爪子在泥地上留下深深的印痕。' +
        '它的头颅宽大，嘴里露出两根弯曲的獠牙。' +
        '蛮疆山林深处养育了许多这样的野物，' +
        '族人称之为「山鬼」，据说能嗅到数里外的气息，雾天出没最为频繁。' +
        '遇上它就要做好准备——这东西护食，驱赶比逃跑更危险。',
    );
    this.set('title', '');
    this.set('gender', 'neutral');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 10);
    this.set('max_hp', 320);
    this.set('hp', 320);
    this.set('combat_exp', 80);
    this.set('personality', 'grumpy');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 5);
    this.set('chat_msg', [
      '林中猛兽低沉地嚎叫一声，声音在雾中传得很远。',
      '林中猛兽在林间穿行，厚重的脚步压得树枝沙沙作响。',
      '林中猛兽停下来嗅闻空气，宽阔的鼻孔急促开合。',
      '林中猛兽抬起头，露出那两根弯曲的獠牙，警告意味十足。',
    ]);
    this.set('inquiry', {
      default: '林中猛兽低吼，猛地后腿蹬地，做出攻击姿态。',
    });
  }
}
