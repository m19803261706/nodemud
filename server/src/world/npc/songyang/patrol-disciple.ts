/**
 * 巡山弟子 — 古松亭
 * 非战斗 NPC，负责巡山值守的嵩阳弟子
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class PatrolDisciple extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '巡山弟子');
    this.set('short', '一名背着长剑巡山的弟子');
    this.set(
      'long',
      '一名二十出头的青年弟子，穿着整洁的灰蓝色门派常服，背着一柄长剑。他步履稳健，目光不时扫过山道两旁的灌木丛，保持着警觉。额头上微微见汗，显然已经走了不短的路。',
    );
    this.set('title', '嵩阳宗');
    this.set('gender', 'male');
    this.set('faction', Factions.SONG_YANG);
    this.set('visible_faction', '嵩阳宗');
    this.set('attitude', 'friendly');
    this.set('level', 8);
    this.set('max_hp', 380);
    this.set('hp', 380);
    this.set('combat_exp', 100);
    this.set('personality', 'dutiful');
    this.set('speech_style', 'formal');
    this.set('sect_id', 'songyang');
    this.set('chat_chance', 12);
    this.set('chat_msg', [
      '巡山弟子抱拳道：「山道平安。」随即继续巡视。',
      '巡山弟子手搭凉棚望了望远处，嘟囔：「今日倒还太平。」',
      '巡山弟子在亭中歇了口气，灌了两口水囊里的水。',
      '巡山弟子拍了拍身上的土，整理了一下剑穗。',
    ]);
    this.set('inquiry', {
      山匪: '巡山弟子皱眉道：「近来乱石坡那边又有山匪出没，师兄若要下山，小心些。」',
      山道: '巡山弟子指了指南方：「沿山道往南走，过了中段就是下山的路，一直走能到裂谷镇。」',
      门派: '巡山弟子抱拳道：「在下只是巡山执勤的内门弟子，门派事务还请问执事院。」',
      default: '巡山弟子道：「师兄有何吩咐？我正巡山呢。」',
    });

    // 漫游：巡山弟子在嵩阳宗山道区域巡视
    this.set('wander', {
      chance: 3, // 每心跳 3% 概率（平均 ~67s 移动一次，体现缓缓巡视）
      rooms: [
        'area/songyang/pine-pavilion',
        'area/songyang/mountain-path',
        'area/songyang/mountain-path-middle',
        'area/songyang/mountain-path-lower',
      ],
    });
  }
}
