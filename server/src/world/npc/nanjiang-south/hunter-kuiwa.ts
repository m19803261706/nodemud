/**
 * 猎人魁蛙 — 雾岚寨·狩猎营
 * 寨中第一猎手，沉默寡言，箭术如神
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class HunterKuiwa extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '魁蛙');
    this.set('short', '一个蹲在地上修整弓弦的魁梧猎人');
    this.set(
      'long',
      '此人身形高大，肩膀宽阔如熊，皮肤黝黑粗糙，像是被风雨反复打磨过的老树皮。' +
        '他蹲在地上，手指粗壮却灵巧地编织着弓弦，' +
        '一条旧疤从左眉斜劈到颧骨，据说是年少时被野猪獠牙划的。' +
        '腰间挂着一把猎刀和一个装满箭矢的竹筒，' +
        '背上的竹弓比他自己还高，弓身上刻着密密的划痕——每一道都是一次猎杀的记录。' +
        '他几乎不说话，偶尔抬头看一眼来人，那目光和山鹰一样锐利，' +
        '然后又低下头，继续手中的活计。',
    );
    this.set('title', '猎手');
    this.set('gender', 'male');
    this.set('faction', Factions.BAI_MAN);
    this.set('visible_faction', '雾岚寨');
    this.set('attitude', 'friendly');
    this.set('level', 12);
    this.set('max_hp', 480);
    this.set('hp', 480);
    this.set('personality', 'stoic');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 20);
    this.set('chat_msg', [
      '魁蛙拉了拉弓弦，弦声嗡嗡，他微微点头，似乎对弦的张力很满意。',
      '魁蛙抬头望了一眼天色，鼻子微微抽动，像是在嗅风中猎物的气味。',
      '魁蛙无声地将一把箭矢排在面前，逐根检查箭羽，把歪的挑出来折断。',
    ]);
    this.set('inquiry', {
      狩猎: '魁蛙沉默了一会，开口时声音低沉如远处的雷：「山里的东西，你不去惹它，它不来惹你。但你要吃饭，它也要吃饭，总有人要让一步。」',
      武学: '魁蛙拍了拍背上的竹弓：「刀剑是人和人打的。弓是人和兽打的。不一样。」他顿了顿，「你要学，先进林子待三天再说。」',
      default: '魁蛙抬头看了你一眼，又低下头去：「嗯。」除此之外，没有更多的话。',
    });
  }
}
