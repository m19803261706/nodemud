/**
 * 山蝮蛇 — 山路·蛮疆段
 * 乱石坡上栖息的蝮蛇，比竹林毒蛇更凶猛
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class MountainViper extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '山蝮蛇');
    this.set('short', '一条盘踞在乱石间的粗壮蝮蛇');
    this.set(
      'long',
      '一条成年蝮蛇，体长近两米，身子比寻常毒蛇粗上一倍，' +
        '鳞片呈灰褐色夹杂暗红斑纹，在碎石间几乎不可辨认。' +
        '它盘踞在一块被阳光晒热的大石上，三角形的头颅微微抬起，' +
        '竖瞳冷冷地注视着周围的动静。' +
        '蛮疆山民说这种蝮蛇的毒液能让人半条胳膊肿上三天，' +
        '但巫医却把它们当宝贝——蛇胆入药，蛇毒炼蛊，浑身是价。',
    );
    this.set('title', '');
    this.set('gender', 'neutral');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 9);
    this.set('max_hp', 200);
    this.set('hp', 200);
    this.set('combat_exp', 55);
    this.set('personality', 'grumpy');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 4);
    this.set('chat_msg', [
      '山蝮蛇缓缓抬起头，吐出分叉的信子，发出低沉的嘶嘶声。',
      '山蝮蛇在石缝间滑动，粗壮的身体蹭得碎石咔咔响。',
      '山蝮蛇突然绷紧身体，做出弹射的姿态，像一张拉满的弓。',
    ]);
    this.set('inquiry', {
      default: '山蝮蛇猛地弹起半截身子，张开大嘴露出两根毒牙，嘶声警告。',
    });
  }
}
