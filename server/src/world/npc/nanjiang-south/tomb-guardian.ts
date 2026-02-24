/**
 * 墓穴傀儡 — 雾岚寨·先祖墓
 * 守护先祖墓的古老傀儡，被蛊术驱动，攻击一切入侵者
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class TombGuardian extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '墓穴傀儡');
    this.set('short', '一个浑身缠满藤蔓的木制傀儡');
    this.set(
      'long',
      '这是一个由硬木拼接而成的人形傀儡，有真人大小，关节处用铜环连接。' +
        '它的身上缠满了枯死的藤蔓和青苔，木头表面刻着密密麻麻的古老符文，' +
        '符文中嵌着细小的蛊虫干尸，像是某种古老的驱动方式。' +
        '它的「脸」只是一块光滑的木板，没有五官，但木板正中嵌着一颗暗红色的石头，' +
        '石头里隐约有什么在蠕动，散发出微弱的幽光。' +
        '它的动作僵硬而缓慢，但每一步都沉重得让地面微微震颤。' +
        '这是先祖墓的守护者，据说是百年前的祭司用禁术制造的，' +
        '只要有外人踏入墓室，它就会被唤醒。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 14);
    this.set('max_hp', 500);
    this.set('hp', 500);
    this.set('combat_exp', 100);
    this.set('personality', 'aggressive');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 5);
    this.set('chat_msg', [
      '墓穴傀儡身上的符文闪烁了一下，它的身体微微颤动，关节处发出咔嗒咔嗒的声响。',
      '墓穴傀儡缓缓转动没有面孔的头颅，胸口的红色石头幽光更盛了几分。',
      '墓穴傀儡举起粗壮的木臂，重重砸在地上，溅起一片碎石和灰尘。',
    ]);
    this.set('inquiry', {
      default: '墓穴傀儡胸口的红色石头猛地亮起，它的身体发出嘎吱嘎吱的声响，朝你逼了过来。',
    });
  }
}
