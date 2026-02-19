/**
 * 水贼 — 水路·江南段
 * 盘踞柳堤水道的水贼，Lv.8 敌对 NPC
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class LakeBandit extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '水贼');
    this.set('short', '一个藏在芦苇丛中的水贼');
    this.set(
      'long',
      '此人肤色黝黑，常年在水上劳作留下的痕迹，' +
        '手脚上有细密的水草划痕，像是经常在芦苇丛中穿行。' +
        '腰间挂着一把短刀和一段粗绳，显然既用于搏斗也用于捆绑。' +
        '他的眼神中带着一种混合了警惕与算计的光芒，' +
        '盘踞江南水道多年，深知哪条路上的行人最好劫。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 8);
    this.set('max_hp', 240);
    this.set('hp', 240);
    this.set('combat_exp', 60);
    this.set('personality', 'grumpy');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 8);
    this.set('chat_msg', [
      '水贼悄悄藏进芦苇丛中，只露出两只警惕的眼睛。',
      '水贼与同伴低声密谋，声音压得极低，听不清内容。',
      '水贼磨着刀，刀口在石头上发出细细的嘶嘶声。',
    ]);
    this.set('inquiry', {
      default: '水贼横眉瞪眼：「过路的，想平平安安过去，把银子留下！」',
    });
    this.set('equipment', [
      { blueprintId: 'item/rift-town/short-knife', position: 'weapon' },
    ]);
  }
}
