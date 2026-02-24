/**
 * 北境猎户 — 官道·北境段
 * 常年在荒原猎狼的独行猎人，性格沉默寡言
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class BorderHunter extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '北境猎户');
    this.set('short', '一个沉默的北境猎户');
    this.set(
      'long',
      '一个身材高瘦的汉子，穿着一件厚实的羊皮袄子，外面罩着狼皮背心，' +
        '皮毛已被风雪磨得发硬。脸上有一道从额角延伸到右颊的旧疤，' +
        '是被草原狼留下的纪念。' +
        '他背着一张角弓，腰间挂着一把猎刀和几个装着药粉的小皮囊。' +
        '眼神锐利而警觉，像是习惯了在旷野中搜寻猎物的目光，' +
        '即使在休息时也不曾真正放松。' +
        '他很少说话，但对北境的地形和野兽习性了如指掌。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 8);
    this.set('max_hp', 280);
    this.set('hp', 280);
    this.set('personality', 'stoic');
    this.set('speech_style', 'terse');
    this.set('chat_chance', 20);
    this.set('chat_msg', [
      '北境猎户蹲在火塘边，用猎刀削着一根木头，木屑卷曲着落入灰烬。',
      '北境猎户翻了翻晾着的狼皮，点了点头，似乎对干燥的程度很满意。',
      '北境猎户抬起头嗅了嗅空气，眉头微微皱了一下，不知闻到了什么。',
      '北境猎户往角弓上试了试弦，弓弦发出嗡的一声低鸣。',
    ]);
    this.set('inquiry', {
      狼: '北境猎户眯起眼睛：「这一带的狼群，冬天最凶。饿极了什么都敢扑。你要过冻原那段路，结伴走，落单就是送死。」',
      路: '北境猎户往北指了指：「过了草原就是朔云关了。路不远，但不好走——草里藏着劫匪，比狼还不讲道理。」他顿了顿，「石堆那里可以歇脚，再往北就别停了。」',
      default:
        '北境猎户看了你一眼，声音低沉：「赶路的？坐吧，火还没灭。」他又低下头去摆弄手里的猎具，不再多话。',
    });
  }
}
