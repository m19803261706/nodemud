/**
 * 老兵刘拐子 — 朔云关·军帐
 * 断了一条腿的老兵，驻守朔云关二十年，满腹故事
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class OldVeteran extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '刘拐子');
    this.set('short', '一个拄着拐杖、缺了一条腿的老兵');
    this.set(
      'long',
      '五十来岁，右腿齐膝而断，裤管空荡荡地折了上去，' +
        '靠一根磨得光亮的木拐支撑着身体。' +
        '脸上皱纹密布，被北风吹得粗糙如树皮，' +
        '但眼神却出人意料地明亮，带着一种经历过太多之后的豁达。' +
        '穿着一件打了无数补丁的旧棉甲，袖口磨得发白。' +
        '他喜欢蹲在火堆旁，一边烤火一边给年轻士兵讲当年的事，' +
        '讲到激动处会挥着拐杖比划，差点打到旁边的人。' +
        '他在朔云关待了二十年，是关城资历最老的兵，' +
        '没人记得他的原名，都叫他"刘拐子"，他也不介意。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.CHENG_TIAN);
    this.set('visible_faction', '承天朝');
    this.set('attitude', 'friendly');
    this.set('level', 7);
    this.set('max_hp', 180);
    this.set('hp', 180);
    this.set('personality', 'warm');
    this.set('speech_style', 'verbose');
    this.set('chat_chance', 55);
    this.set('chat_msg', [
      '刘拐子往火堆里添了根柴，对旁边的年轻兵说：「当年啊，狼庭的铁骑打到城墙下面的时候……」',
      '刘拐子拄着拐杖慢慢挪到帐篷门口，望着北方的天空，半天没说话。',
      '刘拐子拍了拍自己的断腿：「这条腿留在了朔水河边，跟我半辈子的兄弟一起。值了。」',
    ]);
    this.set('inquiry', {
      当年: '刘拐子的眼睛亮了起来：「当年？你说的是二十年前狼庭大举南侵那次？那一仗打了七天七夜，城墙上的血结了冰又化开，化开又结冰。我这条腿就是第三天丢的，被一个北漠骑兵的弯刀砍断了。但我也没吃亏，他的命留在了城下。」他沉默片刻，声音低了下去，「那一仗，我们什长的十个人，最后只剩下我一个。」',
      关城: '刘拐子环顾四周：「朔云关啊，不好也不坏。冬天冷得能把耳朵冻掉，夏天的沙尘暴能把人埋了。粮饷常年不足，朝廷的人许了又忘。但这里是家，我的兄弟都埋在这附近，我走不了了。」',
      default:
        '刘拐子咧嘴一笑：「年轻人，坐下烤烤火，有啥想问的尽管问，老头子别的没有，故事管够。」',
    });
  }
}
