/**
 * 教头石虎 — 朔云关·演武场
 * 严厉的操练教头，身经百战的老兵，训练新兵毫不留情
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class DrillSergeant extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '石虎');
    this.set('short', '一个浑身腱子肉、满脸横肉的教头');
    this.set(
      'long',
      '身材不算高大，但肩膀宽得像一堵墙，两条手臂上的肌肉盘结如绳索。' +
        '面上有一道从额角斜劈到下巴的刀疤，据说是十五年前跟北漠先锋营的骑兵近身搏杀时留下的。' +
        '他总是赤着上身，不管天多冷——据他自己说，' +
        '"怕冷的人上了战场先死"。' +
        '腰间别着一根粗实的木棍，那是他的教鞭，' +
        '挨过他那棍子的新兵没有一千也有八百。' +
        '说话像是在下命令，从不用商量的语气，' +
        '嗓门大得演武场另一头都听得清清楚楚。' +
        '他训出来的兵，活下来的都成了好手。',
    );
    this.set('title', '演武教头');
    this.set('gender', 'male');
    this.set('faction', Factions.CHENG_TIAN);
    this.set('visible_faction', '承天朝');
    this.set('attitude', 'friendly');
    this.set('level', 14);
    this.set('max_hp', 550);
    this.set('hp', 550);
    this.set('personality', 'stern');
    this.set('speech_style', 'terse');
    this.set('chat_chance', 45);
    this.set('chat_msg', [
      '石虎一棍敲在木桩上，朝新兵吼道：「劈快了！你这速度上了战场，刀还没举起来就让人砍成两截！」',
      '石虎双臂抱胸站在场中央，冷眼扫视每一个操练的士兵，谁偷懒就挨一棍。',
      '石虎猛地拔出腰间木棍，在空中劈出一道风声：「今天练到天黑，谁先倒下谁扣饭。」',
    ]);
    this.set('inquiry', {
      操练: '石虎上下打量你：「想练？行。先扎马步半个时辰，扎不住就滚。边关不养废物，你要是连基本功都不行，趁早回南边去。」',
      北漠: '石虎脸色一沉：「北漠人骑射厉害，远了射你，近了砍你，打不过就跑，跑不过就死。所以我练兵只练两样：第一，挨打不退。第二，出手要狠。其他的，都是花架子。」',
      default: '石虎瞪你一眼：「没事别在演武场晃，碍事。」',
    });
  }
}
