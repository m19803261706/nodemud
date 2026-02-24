/**
 * 老兵铁牙 — 黄沙驿·兵器摊
 * 退伍老兵，瘸了一条腿，以修兵器卖兵器为生
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class WeaponSmith extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '铁牙');
    this.set('short', '一个瘸了腿的老兵正在磨刀');
    this.set(
      'long',
      '他右腿从膝盖以下截断了，用一根削得溜光的木桩代替，走路一高一低。' +
        '面目凶悍，左脸有一道长长的刀疤，从眉角一直划到嘴角，把表情永远定格在一种似笑非笑的狰狞上。' +
        '但他的手非常稳，磨刀的时候刀口在磨石上划过，角度始终如一。' +
        '据说他年轻时在边军当过校尉，跟北漠人打了十几年仗，' +
        '腿是在一次突围中被马踩断的。退下来之后没别的本事，就靠兵器吃饭。' +
        '摊子上的每一把刀他都亲手摸过，好坏高低心里清楚得很。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.CHENG_TIAN);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 16);
    this.set('max_hp', 600);
    this.set('hp', 600);
    this.set('personality', 'gruff');
    this.set('speech_style', 'military');
    this.set('chat_chance', 25);
    this.set('chat_msg', [
      '铁牙把一把弯刀架在磨石上，慢慢推过去，火星迸溅。',
      '铁牙用拇指试了试刀锋，点了点头，又继续磨。',
      '铁牙拿起一把剑掂了掂，皱着眉摇了摇头，随手放到一边。',
      '铁牙用木桩腿在地上敲了敲，换了个姿势坐着，嘴里咕哝着什么。',
    ]);
    this.set('inquiry', {
      兵器: '铁牙拿起一把弯刀翻了翻：「这把是西域匠人打的，好钢，韧性足。中原的直刃用的是另一种钢，硬但脆——各有长短，看你用在哪儿。」',
      战场: '铁牙拍了拍木桩腿：「打仗的事？」他沉默了一会儿，「别问了。打过仗的人不爱聊这个。」',
      修理: '铁牙把你的兵器接过来看了看：「行，能修。一般修理三天，加急一天，加急费翻倍——别嫌贵，我的手艺值这个钱。」',
      default: '铁牙瞥了你一眼：「买刀？看看。只看不买也行，但别乱摸——刀不是玩具。」',
    });
  }
}
