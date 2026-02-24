/**
 * 骨卜婆 — 雾岚寨·祭坛
 * 部落祭司，年迈的占卜师，用骨片和火焰预见未来
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class ElderGupo extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '骨卜婆');
    this.set('short', '一个在祭坛前摆弄骨片的干瘦老妇');
    this.set(
      'long',
      '极瘦极老的一个人，佝偻着身子，脊背弓得像一张弯弓。' +
        '满头白发编成无数根细辫，每根辫梢都系着一颗小小的兽骨珠子，' +
        '走动时珠子碰撞，发出细碎的声响。' +
        '她的脸上布满了皱纹，深如刀刻，双眼浑浊中偶尔闪过一丝精光。' +
        '面前的石台上散落着各种骨片——牛骨、羊骨、龟甲，' +
        '她时而拈起一片放在火上烤，看裂纹的走向，嘴里念念有词。' +
        '族人们敬畏她，因为她的占卜据说从未出错。' +
        '也有人说她通鬼神，能看到常人看不到的东西。',
    );
    this.set('title', '祭司');
    this.set('gender', 'female');
    this.set('faction', Factions.BAI_MAN);
    this.set('visible_faction', '雾岚寨');
    this.set('attitude', 'neutral');
    this.set('level', 20);
    this.set('max_hp', 800);
    this.set('hp', 800);
    this.set('personality', 'mysterious');
    this.set('speech_style', 'formal');
    this.set('chat_chance', 25);
    this.set('chat_msg', [
      '骨卜婆将一片龟甲放在火上，龟甲发出噼啪声，她凑近了看裂纹，嘴角微微牵动。',
      '骨卜婆闭着眼，低声吟唱，声音沙哑而绵长，像是从很远的地方传来。',
      '骨卜婆忽然睁开眼，盯着空中某个方向看了一会，然后摇了摇头，又闭上眼。',
    ]);
    this.set('inquiry', {
      占卜: '骨卜婆缓缓抬头，浑浊的眼中闪过一丝光：「你想知道什么？」她拈起一片骨头，放在掌心端详，「骨头不会说谎，但真话未必好听。你确定要听？」',
      祖灵: '骨卜婆向祖灵树的方向微微颔首：「祖灵看着我们。他们走了，但没有离开。每一阵风里都有他们的声音，你听不到，是因为你还不够安静。」',
      default:
        '骨卜婆抬起浑浊的双眼看着你，沉默了很久，才说：「你身上有远方的尘土。」她没有再说更多。',
    });
  }
}
