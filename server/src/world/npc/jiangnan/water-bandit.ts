/**
 * 水匪喽啰 — 烟雨镇·码头巷
 * 在暗巷附近游荡的水匪小头目，敌对
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class WaterBandit extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '水匪喽啰');
    this.set('short', '鬼鬼祟祟的纹身汉子');
    this.set(
      'long',
      '这汉子光着膀子，胸口纹着一条张牙舞爪的黑鱼，' +
        '肌肉结实但不算魁梧，是长年在水上讨生活练出来的精干身板。' +
        '他的皮肤被日头晒得发亮，手臂上有几处新旧交叠的刀疤。' +
        '腰间插着一把短刀，刀柄缠着发黑的布条。' +
        '他的眼神闪烁不定，像是随时在盘算着什么，' +
        '看人的时候总是先打量腰间，估摸对方值不值得动手。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 7);
    this.set('max_hp', 280);
    this.set('hp', 280);
    this.set('combat_exp', 35);
    this.set('personality', 'aggressive');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 40);
    this.set('chat_msg', [
      '水匪喽啰靠在墙角，眯着眼打量来往的行人。',
      '水匪喽啰把玩着手中的短刀，刀尖在指尖转了个圈。',
      '水匪喽啰朝地上吐了口唾沫，不耐烦地换了个姿势。',
    ]);
    this.set('inquiry', {
      水匪:
        '水匪喽啰冷哼一声：「你打听这干什么？' +
        '要是不想惹麻烦，就识趣点走远些。这条巷子不欢迎多嘴的人。」',
      default: '水匪喽啰斜眼瞪你：「看什么看？没见过人啊？' + '赶紧走，别挡道。」',
    });
  }
}
