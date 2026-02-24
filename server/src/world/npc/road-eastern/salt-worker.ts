/**
 * 盐场老汉 — 海路·晒盐坊
 * 在盐田劳作多年的老盐工，熟悉沿海风土
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class SaltWorker extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '盐场老汉');
    this.set('short', '一个弯腰劳作的盐场老汉');
    this.set(
      'long',
      '老汉年约六旬，皮肤被海风和烈日晒成了深棕色，' +
        '手掌粗糙得像砂纸，指缝里嵌着洗不掉的盐渍。' +
        '他穿着一件打满补丁的短褂，袖子高高挽起，' +
        '露出结实的手臂，上面青筋暴起。' +
        '脚上蹬着一双草鞋，已经被盐水泡得发白发硬。' +
        '虽然年纪大了，干起活来却不输年轻人，' +
        '一耙一耙地将粗盐归拢，动作娴熟而有节奏。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 5);
    this.set('max_hp', 150);
    this.set('hp', 150);
    this.set('combat_exp', 30);
    this.set('personality', 'calm');
    this.set('speech_style', 'plain');
    this.set('chat_chance', 10);
    this.set('chat_msg', [
      '盐场老汉用木耙将粗盐归拢成堆，嘴里哼着不知名的小调。',
      '盐场老汉抬头看了看天色，自言自语：「今日日头好，盐能多晒几担。」',
      '盐场老汉用粗布擦了擦额头的汗，喝了一口竹筒里的淡水。',
    ]);
    this.set('inquiry', {
      default:
        '盐场老汉直起腰来：「客官是过路的吧？这条道往东走便是潮汐港，' +
        '不过近来不太平，海盗的人在前面出没，你多留个心眼。」',
    });
  }
}
