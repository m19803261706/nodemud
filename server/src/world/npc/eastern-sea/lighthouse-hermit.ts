/**
 * 灯塔老人 — 潮汐港·破旧灯塔
 * 隐居在灯塔中的神秘老人，据说曾是散盟的元老
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class LighthouseHermit extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '灯塔老人');
    this.set('short', '坐在灯塔下打盹的白发老人');
    this.set(
      'long',
      '一个须发皆白的老人坐在灯塔基座的石阶上，' +
        '身上裹着一件破旧的蓑衣，像是跟这座灯塔一样古老。' +
        '他的脸上布满了深深的皱纹，' +
        '但那双半闭的眼睛偶尔闪过的精光，表明他并不像看上去那么昏聩。' +
        '他的身边放着一杆鱼竿和一壶浑酒，' +
        '但鱼竿上没挂鱼饵，酒壶里也早就空了。' +
        '在潮汐港，没人知道这老人的名字和来历，' +
        '只知道他在灯塔住了很多年，比大多数人在这里待的时间都长。' +
        '偶尔有人说他是散盟的创始人之一，' +
        '但这说法太离谱了，没人当真。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 20);
    this.set('max_hp', 800);
    this.set('hp', 800);
    this.set('combat_exp', 0);
    this.set('personality', 'wise');
    this.set('speech_style', 'scholarly');
    this.set('chat_chance', 35);
    this.set('chat_msg', [
      '灯塔老人半闭着眼，似乎在听海浪的声音，嘴角挂着一丝若有若无的微笑。',
      '灯塔老人用枯瘦的手指摩挲着鱼竿，像是在回忆什么久远的事。',
      '灯塔老人抬头望了望灯塔顶端，轻轻叹了口气，又低下头去。',
    ]);
    this.set('inquiry', {
      灯塔: '灯塔老人缓缓睁开眼：「这灯塔啊，以前是亮着的。那时候潮汐港还不叫这名字，进港的船看见灯光，就知道到家了。后来嘛……灯灭了，人也散了。」',
      散盟: '灯塔老人似笑非笑地看着你：「散盟？年轻人说的散盟，和我知道的散盟，怕不是同一个东西。当年那群人，可没现在这么……没规矩。」',
      潮汐港:
        '灯塔老人拿起空酒壶晃了晃，遗憾地放下：「这港口就像这壶酒，当年满的时候大家都来喝，喝空了也就没人在意了。不过酒壶还在，说不定哪天又会满的。」',
      default: '灯塔老人慢悠悠地说：「年轻人，坐一会吧。海风吹久了，什么心事都能吹散。」',
    });
  }
}
