/**
 * 船匠老马 — 烟雨镇·船坞
 * 手艺精湛的老船匠，沉默寡言
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class ShipwrightMa extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '马铁匠');
    this.set('short', '蹲在船底刷漆的老匠人');
    this.set(
      'long',
      '马铁匠——尽管他造的是船不是铁器，但烟雨镇的人都这么叫他，' +
        '大概是因为他的脾气跟铁一样硬。' +
        '他是个五十出头的粗壮汉子，手臂上的肌肉隆起，' +
        '十根手指粗得像胡萝卜，上面满是刨花和木屑留下的细小伤口。' +
        '他整天弓着腰在船底下钻来钻去，衣服上沾满了桐油和木屑，' +
        '头发也被汗水糊成了一缕一缕的。' +
        '他造的船结实耐用，在东码头一带口碑极好，' +
        '只是排队等他造船的人太多，没个一两年轮不到。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 7);
    this.set('max_hp', 300);
    this.set('hp', 300);
    this.set('combat_exp', 0);
    this.set('personality', 'taciturn');
    this.set('speech_style', 'blunt');
    this.set('chat_chance', 20);
    this.set('chat_msg', [
      '马铁匠用刨子使劲推了几下，一片薄薄的木花卷了起来。',
      '马铁匠往嘴里塞了几颗铁钉，含含糊糊地哼着小调，手上的锤子有节奏地敲着。',
      '马铁匠弯腰检查船底的接缝，用手指仔细摸过每一条缝隙。',
    ]);
    this.set('inquiry', {
      造船:
        '马铁匠头也没抬：「造船？排着呢。' +
        '一条乌篷船最快三个月，大船得大半年。' +
        '急也没用，木头要阴干，桐油要三遍，一步都省不得。」',
      东码头:
        '马铁匠往船底又刷了一层桐油：「东码头那边的船我修过不少。' +
        '老七的船还行，就是年头久了，明年该换龙骨了。' +
        '别的……我只管造船，其他事不归我管。」',
      default: '马铁匠擦了把汗，抬眼瞥了你一下：「要修船还是看船？' + '修船排号，看船别碰。」',
    });
  }
}
