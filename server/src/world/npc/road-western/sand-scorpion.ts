/**
 * 沙蝎 — 丝路·西域段
 * 西域荒漠中的毒蝎，中级敌对野怪，尾刺含毒
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class SandScorpion extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '沙蝎');
    this.set('short', '一只在沙中潜行的巨型沙蝎');
    this.set(
      'long',
      '比拳头大上一圈的蝎子，全身呈黄褐色，与黄沙浑然一体，不仔细看几乎发现不了它。' +
        '八条腿在沙面上移动时悄无声息，两只巨螯向前伸展，' +
        '尾节高高翘起，末端的毒针在阳光下隐约发亮。' +
        '西域的沙蝎毒性远比中原的蝎子更烈，' +
        '被刺中后不及时处理，轻则肢体麻痹，重则丧命。' +
        '遗迹废墟里尤其多，大概是因为那里阴凉避光，适合它们藏身。',
    );
    this.set('title', '');
    this.set('gender', 'neutral');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 14);
    this.set('max_hp', 280);
    this.set('hp', 280);
    this.set('combat_exp', 90);
    this.set('personality', 'grumpy');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 3);
    this.set('chat_msg', [
      '沙蝎高高翘起那根毒尾，针尖对着靠近的方向。',
      '沙蝎悄无声息地在沙中潜行，只有它经过的地方留下一道细微的痕迹。',
      '沙蝎感知到震动，两只钳子迅速张开，摆出攻击姿态。',
    ]);
    this.set('inquiry', {
      default: '沙蝎高举毒尾，发出警告性的点击声，随时准备发起攻击。',
    });
  }
}
