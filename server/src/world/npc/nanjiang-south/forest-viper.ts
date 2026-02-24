/**
 * 林蝮蛇 — 雾岚寨·密林深处
 * 深山密林中出没的毒蛇，攻击性强
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class ForestViper extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '林蝮蛇');
    this.set('short', '一条盘踞在枯叶间的绿褐色毒蛇');
    this.set(
      'long',
      '这是一条成人手臂粗细的毒蛇，通体绿褐色，鳞片上有不规则的深色斑纹，' +
        '与落叶和枯枝几乎融为一体，不仔细看根本发现不了。' +
        '它盘成一团蜷缩在落叶堆里，三角形的扁头微微抬起，' +
        '吐信的舌头细如红线，不断地探测着周围的气味。' +
        '它的眼睛是竖瞳，金黄色的虹膜中透着冰冷的杀意。' +
        '南疆的林蝮蛇毒性不算最烈，但被咬一口也够人难受好几天，' +
        '伤口会肿胀发黑，若不及时处理，严重的会烂到见骨。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 9);
    this.set('max_hp', 260);
    this.set('hp', 260);
    this.set('combat_exp', 55);
    this.set('personality', 'aggressive');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 5);
    this.set('chat_msg', [
      '林蝮蛇吐着细长的信子，三角形的头颅微微摇摆，似在寻找猎物的方位。',
      '林蝮蛇缓缓收紧身体，鳞片摩擦落叶发出沙沙的声响。',
      '林蝮蛇猛地弹起头部，朝着空气中虚咬了一口，露出两颗细小的毒牙。',
    ]);
    this.set('inquiry', {
      default: '林蝮蛇嘶嘶地吐着信子，尾巴急速拍打地面，摆出攻击姿态。',
    });
  }
}
