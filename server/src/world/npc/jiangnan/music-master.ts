/**
 * 琴师沈秋水 — 烟雨镇·清音琴馆
 * 隐居的琴艺大师，据传与某位江湖高手有旧
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class MusicMaster extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '沈秋水');
    this.set('short', '闭目抚琴的白衣女子');
    this.set(
      'long',
      '沈秋水一袭素白衣裙，乌发如瀑披在身后，只用一根木簪随意挽了个髻。' +
        '她的五官清丽而冷淡，眉间有一抹若有似无的愁意，' +
        '仿佛那些年月的故事都沉在了眼底。' +
        '她的手指纤细修长，指尖有弹琴磨出的薄茧，' +
        '抚琴时双目微阖，嘴角带着一丝旁人读不懂的笑意。' +
        '据说她曾是某位大家的入室弟子，因故隐居烟雨镇，' +
        '不问世事，只以琴声度日。',
    );
    this.set('title', '清音琴馆 馆主');
    this.set('gender', 'female');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 12);
    this.set('max_hp', 500);
    this.set('hp', 500);
    this.set('combat_exp', 0);
    this.set('personality', 'distant');
    this.set('speech_style', 'poetic');
    this.set('chat_chance', 30);
    this.set('chat_msg', [
      '沈秋水的指尖在琴弦上轻轻一拨，一段清越的旋律如水般流淌开来。',
      '沈秋水停下抚琴，望着窗外的竹影出神，不知在想什么。',
      '沈秋水为古琴调弦，侧耳倾听每一根弦的音色，神情专注。',
    ]);
    this.set('inquiry', {
      琴谱:
        '沈秋水抬眼看了你一瞬，又低下头去：「那幅残谱是师父留下的，' +
        '只余半阙，我弹了十年也未能补全。有些曲子，大概注定是残缺的。」',
      师父:
        '沈秋水的手指在琴弦上顿了顿，片刻后才轻声道：' +
        '「师父的事，不必再提。有些人走了便是走了，' +
        '留下的琴声还在就够了。」',
      default:
        '沈秋水并未抬头，手指仍在弦上游走：「若是来听琴的，请坐。' +
        '若是来问事的……琴馆只谈琴，不谈旁的。」',
    });
  }
}
