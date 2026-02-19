/**
 * 茶馆掌柜顾婉 — 烟雨镇·听雨茶楼
 * 碧澜阁在烟雨镇的眼线，表面经营茶楼，实则消息灵通
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class TeahouseGu extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '顾婉');
    this.set('short', '笑盈盈的茶楼掌柜');
    this.set(
      'long',
      '顾婉穿着一身烟灰色棉布衫，发髻上别着一支玉簪，' +
        '手腕上的碧玉镯随动作轻轻碰撞，发出清脆的声响。' +
        '她的笑容永远挂在脸上，却从不让人猜出她真正在想什么。' +
        '多年经营茶楼，她已练就一双看人的眼睛，' +
        '三言两语便能摸清来客的底细与来意。' +
        '据说她是碧澜阁在烟雨镇布下的一颗棋，' +
        '但这话只在茶后私下流传，从无人敢当面提起。',
    );
    this.set('title', '烟雨镇 茶楼掌柜');
    this.set('gender', 'female');
    this.set('faction', Factions.BI_LAN);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 10);
    this.set('max_hp', 400);
    this.set('hp', 400);
    this.set('combat_exp', 0);
    this.set('personality', 'cunning');
    this.set('speech_style', 'formal');
    this.set('chat_chance', 55);
    this.set('chat_msg', [
      '顾婉端起茶盏轻抿一口，眼神却悄悄扫过四周的客人。',
      '顾婉细心地整理茶具，每一件都擦得纤尘不染。',
      '顾婉低声吩咐伙计添茶，声音轻得像是不想让旁人听见。',
      '顾婉微笑着观察着来来往往的客人，眼底一片平静。',
    ]);
    this.set('inquiry', {
      消息: '顾婉笑意加深：「消息？消息这东西嘛，得看您出的价。好茶配好价，这是规矩。」',
      碧澜阁:
        '顾婉轻轻一笑，端起茶壶替你续了一盏，只是微笑，没有说话，' +
        '那沉默本身便已是一种暗示——若有缘，她或许会引你去见某位贵人。',
      default: '顾婉笑盈盈地迎上来：「客官请坐，今日龙井刚到，可要尝尝？」',
    });
  }
}
