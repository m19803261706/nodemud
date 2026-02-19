/**
 * 船医秋棠 — 潮汐港·海风客栈
 * 冷淡严肃的船医，见过海上一切伤与死，不多话但极专业
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class DoctorQiu extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '秋棠');
    this.set('short', '在角落专心缝合伤口的船医');
    this.set(
      'long',
      '秋棠是个三十多岁的清瘦女子，手指细长，动作精准，' +
        '每一针都落得不差分毫。' +
        '她的药箱放在脚边，内部收拾得井井有条，' +
        '各种草药、针线、剪刀各归其位，连摆放的角度都不差一丝。' +
        '她很少说话，就算说也是简短的、带着医者特有的直白。' +
        '在海上跑了多年船医，她见过的伤够写一本厚书，' +
        '但那些都在她的眼里沉下去了，什么表情也没留下。',
    );
    this.set('title', '');
    this.set('gender', 'female');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 16);
    this.set('max_hp', 600);
    this.set('hp', 600);
    this.set('combat_exp', 0);
    this.set('personality', 'stern');
    this.set('speech_style', 'formal');
    this.set('chat_chance', 25);
    this.set('chat_msg', [
      '秋棠低头缝合面前的伤口，手上不停，只是眉头微微蹙了一下。',
      '秋棠打开药箱查看存量，将几瓶草药重新归位，盖严盖子。',
      '秋棠冷淡地翻看一本发黄的药典，偶尔用笔在空白处记下什么。',
    ]);
    this.set('inquiry', {
      治疗: '秋棠抬眼看了你一下：「坐下，别动。」她的手指已经开始检查伤口。',
      毒: '秋棠放下手中的活：「海里的毒我见过一百种，陆上的也差不多认全了。说吧，什么症状？」',
      default: '秋棠头也不抬地说：「没病别来，我这不是客栈。」',
    });
  }
}
