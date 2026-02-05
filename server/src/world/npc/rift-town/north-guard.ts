/**
 * 北门卫兵 — 裂隙镇北门
 * 承天朝驻镇卫兵，守卫北门通往裂谷方向
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class NorthGuard extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '北门卫兵');
    this.set('short', '一个身着铁甲的卫兵');
    this.set(
      'long',
      '北门前站着一名身着制式铁甲的卫兵，腰佩长刀，神情警惕。' +
        '他的铠甲上刻着承天朝的日纹徽记，胸口的铭牌表明他隶属裂隙镇驻防哨。' +
        '虽然只是个小镇卫兵，但他站得笔直，目光不时扫向北方裂谷的方向。',
    );
    this.set('title', '承天朝');
    this.set('gender', 'male');
    this.set('faction', Factions.CHENG_TIAN);
    this.set('visible_faction', '承天朝');
    this.set('attitude', 'neutral');
    this.set('level', 20);
    this.set('max_hp', 900);
    this.set('hp', 900);
    this.set('chat_chance', 8);
    this.set('chat_msg', [
      '北门卫兵警惕地注视着北方的道路。',
      '北门卫兵按了按腰间的刀柄，目光扫过四周。',
      '北门卫兵挺了挺胸，调整了一下站姿。',
    ]);
    this.set('inquiry', {
      北方: '北门卫兵正色道：「北边通往裂谷深处，最近不太平。没事别往北走，要去的话，自己多加小心。」',
      承天朝:
        '北门卫兵挺起胸膛：「我等奉承天朝之命驻守裂隙镇，保一方平安。有什么事，可以找我们。」',
      裂谷: '北门卫兵压低声音：「裂谷里最近有异动，上头让我们加强巡逻。具体什么情况，不方便说。」',
      default: '北门卫兵摆摆手：「我只负责守门，别的事情不归我管。」',
    });
    this.set('equipment', [
      { blueprintId: 'rift-town/iron-helmet', position: 'head' },
      { blueprintId: 'rift-town/guard-armor', position: 'body' },
      { blueprintId: 'rift-town/iron-vambrace', position: 'hands' },
      { blueprintId: 'rift-town/military-boots', position: 'feet' },
      { blueprintId: 'rift-town/leather-belt', position: 'waist' },
      { blueprintId: 'rift-town/guard-blade', position: 'weapon' },
    ]);
  }
}
