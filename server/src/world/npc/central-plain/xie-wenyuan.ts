/**
 * 遗老谢文远 — 洛阳废都·万宗广场
 * 昔日门派遗老，博学多识，醉酒吟诗，对往昔门派往事如数家珍
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class XieWenyuan extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '谢文远');
    this.set('short', '一位醉眼朦胧的老者');
    this.set(
      'long',
      '一位年近花甲的老者，身着洗得发白的青衫，袖口和衣领绣着已经磨损的暗纹，' +
        '隐约是某个门派的标识，只是再也无从辨认。' +
        '他手持一只缺口的酒壶，时而饮一口，时而望着广场中央发呆。' +
        '眼神浑浊却偶尔闪过一丝锐利，那是藏在酒里的清醒。' +
        '他叫谢文远，是废都里有名的"遗老"——那些曾亲历门派鼎盛时代，' +
        '如今只剩记忆的人。',
    );
    this.set('title', '遗老');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 15);
    this.set('max_hp', 500);
    this.set('hp', 500);
    this.set('personality', 'scholarly');
    this.set('speech_style', 'scholarly');
    this.set('chat_chance', 60);
    this.set('chat_msg', [
      '谢文远仰头灌了一口酒，随口吟道：「千门万户曈曈日，偏我此身落黄昏。」',
      '谢文远摇摇头，喃喃道：「各大门派，争了一辈子，到头来，碑都倒了……」',
      '谢文远望着广场中央，眼神飘远：「那年盟誓，我也在场，人山人海，盛况空前……」',
      '谢文远自嘲地笑了笑：「遗老，遗老，被时代遗留下来的老人，哈。」',
    ]);
    this.set('inquiry', {
      门派: '谢文远眼神一亮，放下酒壶：「你问哪个门派？唉，说来话长。那年各派在此立盟，嵩阳宗、云岳派、碧澜阁……个个人才辈出，如今……」他摆了摆手，重新举起酒壶。',
      遗迹: '谢文远压低声音：「这城里的底细，老夫知道几分。断壁残殿那边，旧殿地基下头，据说有人藏过东西。至于是什么……你若有心，自己去看看。」',
      default: '谢文远醉眼朦胧地看了你一眼：「年轻人，你来这里……是找什么呢？」他没等你回答，又举起了酒壶。',
    });
  }
}
