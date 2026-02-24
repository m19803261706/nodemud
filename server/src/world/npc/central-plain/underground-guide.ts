/**
 * 鼠爷 — 洛阳废都·暗道入口
 * 暗和堂外围，眼线灵敏，看守地下通道入口，按次收费
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class UndergroundGuide extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '鼠爷');
    this.set('short', '一个眼睛发亮的瘦小男人');
    this.set(
      'long',
      '一个蜷缩在入口阴影里的瘦小男人，身量矮小，动作却总是出奇地快——' +
        '你以为他没注意你，他已经把你从头到脚打量了一遍。' +
        '他的眼睛在暗处发着幽幽的亮光，令人想起真正的老鼠。' +
        '嘴边嗑瓜子的动作从不停歇，瓜子壳总是精准落进脚边的破碗里。' +
        '他自称"鼠爷"，在废都地下颇有名气——' +
        '但哪个堂口的人，他从来不说。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.AN_HE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 10);
    this.set('max_hp', 350);
    this.set('hp', 350);
    this.set('personality', 'cunning');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 40);
    this.set('chat_msg', [
      '鼠爷缩在入口旁，嗑着瓜子，瓜子壳精准地吐进一个破碗里。',
      '鼠爷竖起耳朵听了听地下的动静，满意地点了点头。',
      '鼠爷用小刀在墙上刻着什么——像是某种记号。',
    ]);
    this.set('inquiry', {
      暗道: '鼠爷嘿嘿一笑：「这底下比你想的大得多。有些路通到城外，有些路……通到你不该去的地方。想进去？每次一百文。」',
      暗河堂: '鼠爷脸色一变：「嘘！这名字别乱提。我只是个看门的，什么都不知道。」',
      default: '鼠爷打量你一番：「生面孔。要进地下？先交钱。」',
    });
  }
}
