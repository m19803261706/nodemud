/**
 * 官道盗匪 — 官道·中原段
 * 低级敌对 NPC，盘踞在官道上劫掠行人，曾是流民或失业兵丁
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class RoadBandit extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '官道盗匪');
    this.set('short', '一个拦路的盗匪');
    this.set(
      'long',
      '一个体格壮实的汉子，穿着一身破旧的短打，头上缠着肮脏的布巾。' +
        '腰间别着一把短刀，刀柄已被汗水磨得发黑。' +
        '他的眼神凶狠而谨慎，像一头饿久了的野狗打量猎物。' +
        '据说这些人大多是乱世中失了田地的流民，或是解散后无处可去的军卒，' +
        '在走投无路时落草官道，靠劫掠商旅为生。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 4);
    this.set('max_hp', 160);
    this.set('hp', 160);
    this.set('combat_exp', 40);
    this.set('personality', 'grumpy');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 8);
    this.set('chat_msg', [
      '官道盗匪警惕地四处张望，手悄悄按上了刀柄。',
      '官道盗匪冷笑一声，斜眼打量着你的行囊。',
      '官道盗匪无聊地踢了踢脚边的石子，石子滚入路旁枯草丛里。',
    ]);
    this.set('inquiry', {
      default: '官道盗匪横眉冷对：「走路的，把值钱的东西掏出来，爷今天心情好，留你条命。」',
    });
    this.set('equipment', [{ blueprintId: 'item/rift-town/short-knife', position: 'weapon' }]);
  }
}
