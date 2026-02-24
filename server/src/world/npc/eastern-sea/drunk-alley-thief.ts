/**
 * 巷中扒手 — 潮汐港·醉汉巷
 * 假装醉酒实则伺机行窃的小偷
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class DrunkAlleyThief extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '巷中扒手');
    this.set('short', '蜷缩在墙角的"醉汉"');
    this.set(
      'long',
      '一个瘦小的身影蜷缩在墙角，看起来像是喝得不省人事。' +
        '但仔细观察会发现，他的呼吸太均匀了，' +
        '而且每当有人经过，他那半闭的眼睛就会微微张开一条缝。' +
        '他穿着一件又脏又破的灰色短衫，' +
        '指甲下面却意外地干净——这双手显然不是干粗活的。' +
        '在醉汉巷里混迹的扒手不止一个，' +
        '但能活到现在的都有两把刷子：' +
        '手要快，腿要快，最重要的是——识人要准，' +
        '能打的不碰，有钱又好欺负的才下手。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 15);
    this.set('max_hp', 450);
    this.set('hp', 450);
    this.set('combat_exp', 22);
    this.set('personality', 'cowardly');
    this.set('speech_style', 'sly');
    this.set('chat_chance', 30);
    this.set('chat_msg', [
      '"醉汉"发出一阵含糊的呢喃，身体却悄悄朝一个路人的方向挪了挪。',
      '"醉汉"似乎翻了个身，手却在地上快速摸索了一下，像是在找什么。',
      '"醉汉"打了个酒嗝，但那双眼睛在昏暗中精光一闪。',
    ]);
    this.set('inquiry', {
      default: '"醉汉"含糊不清地嘟囔了几句，翻了个身背对着你。看不出是真醉还是装的。',
    });
  }
}
