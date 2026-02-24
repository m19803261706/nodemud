/**
 * 老船夫 — 水路·雨中渡口
 * 渡口摆渡的老人，在这条水路上撑了一辈子船
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class FerryBoatman extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '老船夫');
    this.set('short', '一个披着蓑衣的老船夫');
    this.set(
      'long',
      '老船夫年近七旬，身形瘦削却精神矍铄，' +
        '一件蓑衣从年轻时穿到了现在，补了又补，倒也合身。' +
        '他的手掌又大又硬，虎口处有厚厚的老茧，' +
        '那是握了几十年竹篙磨出来的。' +
        '花白的头发用一根竹簪随意挽着，雨水顺着发梢往下滴，' +
        '他却浑然不觉，像是早已习惯了这片雨雾。' +
        '老人话不多，但偶尔说起这条水路上的旧事，' +
        '语气悠悠的，像是在讲别人的故事。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 8);
    this.set('max_hp', 200);
    this.set('hp', 200);
    this.set('combat_exp', 40);
    this.set('personality', 'calm');
    this.set('speech_style', 'plain');
    this.set('chat_chance', 8);
    this.set('chat_msg', [
      '老船夫将竹篙插入水中，船身平稳地向前滑去，水波不兴。',
      '老船夫抬头看了看天色，喃喃道：「又要下雨了，这渡口的雨，一年到头下不完。」',
      '老船夫坐在船头，用旱烟袋慢慢地装了一锅烟丝，火光在雨中明明灭灭。',
    ]);
    this.set('inquiry', {
      default:
        '老船夫吐了一口烟：「年轻人，这条水路我走了四十年了。' +
        '以前水贼没这么多，柳堤上还常有书生吟诗呢。' +
        '如今世道变了，不过烟雨镇还是老样子，到了你就知道了。」',
    });
  }
}
