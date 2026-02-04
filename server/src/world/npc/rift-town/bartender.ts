/**
 * 酒保 — 裂隙镇断崖酒馆
 * 消息灵通的酒馆老板，什么人都见过
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class Bartender extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '酒保');
    this.set('short', '一个不苟言笑的中年男子');
    this.set(
      'long',
      '柜台后的酒保四十来岁，一张不苟言笑的国字脸。' +
        '他擦杯子的动作不紧不慢，但每个进门的人都逃不过他那双精明的眼睛。' +
        '据说他在裂隙镇开了二十年酒馆，什么人没见过，什么事没听过。',
    );
    this.set('title', '断崖酒馆');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 15);
    this.set('max_hp', 500);
    this.set('hp', 500);
    this.set('chat_chance', 15);
    this.set('chat_msg', [
      '酒保擦了擦柜台上的酒渍。',
      '酒保不紧不慢地擦着杯子。',
      '酒保抬头扫了一眼酒馆里的客人。',
      '酒保从柜台下拿出一坛酒，拍去上面的灰尘。',
    ]);
    this.set('inquiry', {
      '消息':
        '酒保放下手里的杯子，压低声音说：「最近裂谷深处不太平，有人说看到奇怪的光芒。北门的卫兵加了岗，你要是想往北走，最好小心点。」',
      '裂隙镇':
        '酒保说：「裂隙镇虽小，但南来北往的人可不少。这里的人嘛，大多是为了讨口饭吃，不过也有些来历不明的家伙。」',
      '旅人':
        '酒保朝角落里努了努嘴：「那个人？来了有段日子了，整天闷坐着喝酒，也不跟人说话。我看他身手不凡，你最好别去招惹。」',
      default:
        '酒保不置可否地摇了摇头：「这种事我可不清楚，你去问问广场上的老镇长。」',
    });
  }
}
