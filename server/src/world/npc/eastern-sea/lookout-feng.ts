/**
 * 瞭望手阿凤 — 潮汐港·瞭望塔
 * 负责在瞭望塔值守的女斥候，眼力极好
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class LookoutFeng extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '阿凤');
    this.set('short', '倚在栏杆上眺望海面的年轻女子');
    this.set(
      'long',
      '阿凤是个二十来岁的年轻女子，身材灵巧，扎着一条马尾，' +
        '被海风吹得像一面小旗。' +
        '她穿着一身便于攀爬的短打，脚上是软底的布鞋，' +
        '腰间挂着一支短笛和一柄小刀。' +
        '她的眼力在整个潮汐港首屈一指——' +
        '据说她能在十里外分辨出一条船的旗号，' +
        '也能在月黑风高的夜晚看见礁石上的人影。' +
        '她是霍三刀手下少数几个真正信任的人之一，' +
        '不是因为她多忠心，而是因为她的消息从没出过差错。',
    );
    this.set('title', '瞭望手');
    this.set('gender', 'female');
    this.set('faction', Factions.SAN_MENG);
    this.set('visible_faction', '潮汐港');
    this.set('attitude', 'neutral');
    this.set('level', 17);
    this.set('max_hp', 580);
    this.set('hp', 580);
    this.set('combat_exp', 0);
    this.set('personality', 'alert');
    this.set('speech_style', 'casual');
    this.set('chat_chance', 35);
    this.set('chat_msg', [
      '阿凤举起望远镜朝远处看了一眼，随即放下，微微摇头。',
      '阿凤拿起短笛吹了两个音，又放下了，似乎只是在打发时间。',
      '阿凤眯着眼看向港湾入口，忽然坐直了身子，随即又松懈下来——虚惊一场。',
    ]);
    this.set('inquiry', {
      船: '阿凤指了指远处的海面：「今天进港三条船，出港两条。最大的那条挂着散盟的旗，其余的都是渔船。你要打听哪条？」',
      霍三刀:
        '阿凤耸了耸肩：「三刀叔？他人不坏，就是脾气大了点。他让我看海，我就看海。别的事不归我管。」',
      default: '阿凤头也不转地说：「来这做什么？没事别上来，塔上挤不下两个人。」',
    });
  }
}
