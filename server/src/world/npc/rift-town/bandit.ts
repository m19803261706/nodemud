/**
 * 裂谷盗匪 — 裂谷北道
 * 低级敌对 NPC，盘踞在裂谷北道劫掠过往行人
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class Bandit extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '裂谷盗匪');
    this.set('short', '一个鬼鬼祟祟的盗匪');
    this.set(
      'long',
      '一个身材瘦削的男子，穿着一身脏兮兮的灰褐色短打，' +
        '腰间别着一把卷了刃的短刀。他的眼神闪烁不定，' +
        '不时警惕地打量着周围。脸上有一道陈旧的刀疤，' +
        '从左眉角一直划到颧骨，看起来凶相毕露。' +
        '据说这些盗匪原本是流民，在裂谷中聚集后渐渐为非作歹。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 5);
    this.set('max_hp', 200);
    this.set('hp', 200);
    this.set('combat_exp', 50);
    this.set('personality', 'grumpy');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 8);
    this.set('chat_msg', [
      '裂谷盗匪警惕地四处张望，手按在刀柄上。',
      '裂谷盗匪嘿嘿笑了两声，露出一口黄牙。',
      '裂谷盗匪朝地上啐了一口，不耐烦地踢了踢脚边的石子。',
    ]);
    this.set('inquiry', {
      default: '裂谷盗匪凶狠地瞪了你一眼：「少废话，识相的把身上值钱的东西留下！」',
    });
    this.set('equipment', [{ blueprintId: 'item/rift-town/short-knife', position: 'weapon' }]);
  }
}
