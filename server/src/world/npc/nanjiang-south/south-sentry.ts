/**
 * 哨兵阿嘎 — 雾岚寨·南界哨卡
 * 寨南边界的守卫，忠诚而警觉，对陌生人抱有戒心
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class SouthSentry extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '阿嘎');
    this.set('short', '一个持矛守在路口的苗族哨兵');
    this.set(
      'long',
      '他身材不高但敦实，穿着一身短打猎装，腿上缠着绑腿，脚蹬一双磨得发白的牛皮靴。' +
        '手里握着一根长矛，矛杆是削光的硬木，矛头有些钝了，但依然泛着冷光。' +
        '他的目光一直盯着南面的山路，偶尔侧耳倾听林中的动静，' +
        '每当有风吹草动，他的身体就微微绷紧，像一只随时准备扑出去的豹子。' +
        '他的脸上有几道浅浅的刺青——那是寨中勇士才有的标记，' +
        '虽然年纪不大，但已经守了三年的南哨。',
    );
    this.set('title', '哨兵');
    this.set('gender', 'male');
    this.set('faction', Factions.BAI_MAN);
    this.set('visible_faction', '雾岚寨');
    this.set('attitude', 'friendly');
    this.set('level', 11);
    this.set('max_hp', 420);
    this.set('hp', 420);
    this.set('personality', 'cautious');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 25);
    this.set('chat_msg', [
      '阿嘎握紧长矛，目光警惕地扫视着南面的密林，耳朵微微动了动。',
      '阿嘎用矛杆在地上划了几道痕迹，像是在记录什么。',
      '阿嘎从腰间的水壶里喝了一口水，眼睛始终没有离开过南面的山路。',
    ]);
    this.set('inquiry', {
      南面: '阿嘎的表情严肃起来：「南面不好走。毒虫多，瘴气也重。再往深了去，还有毒谷，连猎人都不敢进。你要是想往南走，最好找个本地人带路。」',
      守卫: '阿嘎拍了拍手里的长矛：「守南哨三年了。白天还好，夜里才难熬——林子里什么声音都有，你得分清哪个是风声，哪个是脚步声。」',
      敌人: '阿嘎压低声音：「山下偶尔有不怀好意的外人摸上来。还有深林里的毒物，到了夜里胆子就大了。寨子能安稳到今天，靠的就是我们这些守哨的。」',
      default: '阿嘎上下打量了你一眼：「你从哪来的？走南面上来的？那你胆子不小。」',
    });
  }
}
