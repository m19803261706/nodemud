/**
 * 仙岛使者凌虚 — 潮汐港·远航码头
 * 神秘的出海引路人，招募"有缘人"前往传说中的无名岛
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class ImmortalLing extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '凌虚');
    this.set('short', '站在码头边望海的白衣人');
    this.set(
      'long',
      '凌虚看上去不过三十上下，白衣胜雪，发丝散在肩头，随海风轻轻飘拂。' +
        '他的眼睛极为平静，像是已经见过太多值得惊讶的事，' +
        '所以什么都不再令他惊讶。' +
        '手中拈着一朵不知从哪摘来的白花，花瓣已半凋零，' +
        '他浑然不觉，只是静静地望着海天交界处，' +
        '仿佛那里有什么旁人看不见的东西。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 18);
    this.set('max_hp', 800);
    this.set('hp', 800);
    this.set('combat_exp', 0);
    this.set('personality', 'friendly');
    this.set('speech_style', 'scholarly');
    this.set('chat_chance', 40);
    this.set('chat_msg', [
      '凌虚望向遥远的海天交界，神情悠远，像是在与某个不在场的人对话。',
      '凌虚将手中的花瓣一片片放入海中，看着它们随浪漂远。',
      '凌虚对着吹来的海风说了几句话，内容随风散去，旁人一句也没听清。',
    ]);
    this.set('inquiry', {
      仙岛: '凌虚微微侧首，嘴角弯起一丝笑意：「有缘人自会知晓。你既然问了，或许你就是那个有缘人。」',
      出海:
        '凌虚轻声道：「海上有座无名岛，等有缘人去。去的路，不在图上，在心里。' +
        '当你真的准备好了，自然会找到。」',
      default: '凌虚回头望你一眼，轻声问：「海风中有故人的气息，你闻到了吗？」',
    });
  }
}
