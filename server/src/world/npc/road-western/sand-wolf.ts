/**
 * 沙狼 — 丝路·胡杨枯林
 * 西域荒漠中的野狼，体型瘦削但凶猛，成群出没于枯林间
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class SandWolf extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '沙狼');
    this.set('short', '一匹在枯木间游荡的沙狼');
    this.set(
      'long',
      '体型比中原的灰狼小一圈，但更精瘦、更结实，' +
        '皮毛是一种接近黄沙的暗褐色，混在戈壁和枯木间几乎看不出来。' +
        '它的眼睛是浅琥珀色的，盯着人看的时候冷冰冰的，' +
        '没有中原犬类那种亲近感，只有算计——在评估你是不是值得冒险去咬。' +
        '沙狼很少单独行动，如果你看见了一匹，附近多半还有更多。' +
        '它们在胡杨枯林里进出自如，把这片死人才不嫌弃的地方当成了领地。',
    );
    this.set('title', '');
    this.set('gender', 'neutral');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 13);
    this.set('max_hp', 320);
    this.set('hp', 320);
    this.set('combat_exp', 85);
    this.set('personality', 'grumpy');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 5);
    this.set('chat_msg', [
      '沙狼蹲伏在枯木的阴影里，尾巴低垂，琥珀色的眼睛一眨不眨地盯着你。',
      '沙狼发出一声低沉的呜咽，不像是威胁，更像是在呼唤同伴。',
      '沙狼绕着你慢慢走了半圈，保持着一段不远不近的距离，像是在试探。',
      '沙狼忽然竖起耳朵，朝远处望了一眼，然后又把注意力转回你身上。',
    ]);
    this.set('inquiry', {
      default: '沙狼龇起牙齿，喉咙里发出持续的低吼，前腿微微弯曲，随时准备扑上来。',
    });
  }
}
