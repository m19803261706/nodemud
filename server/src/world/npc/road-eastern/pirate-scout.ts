/**
 * 海盗斥候 — 海路·海蚀崖
 * 散盟旗下的哨兵，监视进出港口的可疑人物
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class PirateScout extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '海盗斥候');
    this.set('short', '藏在礁石后的海盗哨兵');
    this.set(
      'long',
      '此人穿着一件褪色的水蓝布衫，腰间缠着皮带，插着一把短刃。' +
        '他习惯性地蹲伏着，将自己藏在礁石或崖洞的阴影里，' +
        '却把周围动静尽收眼底。' +
        '手腕上戴着一节骨哨，紧急时候可以吹出信号，' +
        '传到数里之外的同伴耳中。' +
        '散盟的斥候不轻易暴露，但一旦认定你是威胁，便不会手软。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.SAN_MENG);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 10);
    this.set('max_hp', 300);
    this.set('hp', 300);
    this.set('combat_exp', 75);
    this.set('personality', 'grumpy');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 6);
    this.set('chat_msg', [
      '海盗斥候举起望远镜，仔细扫视着海面上每一个可疑的黑点。',
      '海盗斥候悄悄在岩石上刻下一个记号，与之前的记号排成一排。',
      '海盗斥候低声吹了一声短促的口哨，侧耳等待远处的回应。',
    ]);
    this.set('inquiry', {
      default: '海盗斥候冷冷地打量你：「这条路不是谁都能走的。你是哪边的人？」',
    });
    this.set('equipment', [
      { blueprintId: 'item/rift-town/short-knife', position: 'weapon' },
    ]);
  }
}
