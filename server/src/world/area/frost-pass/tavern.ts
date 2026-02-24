/**
 * 朔云关·霜刀客栈 — 朔云关
 * 坐标: (-1, 0, 0)
 * 关城唯一的客栈，供过路商旅和江湖客歇脚
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class FrostPassTavern extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '朔云关·霜刀客栈');
    this.set(
      'long',
      '客栈不大，一楼是酒堂，二楼是客房，招牌上写着"霜刀"两个字，' +
        '据说是因为第一任掌柜是个退伍的刀客，用自己的佩刀做了招牌。' +
        '堂内摆着七八张方桌，桌面被酒水浸泡得黏手。' +
        '柜台后面的酒坛子一溜排开，最便宜的是烧刀子，两文钱一碗，' +
        '辣喉但暖身，是边关将士最常喝的。' +
        '角落里常坐着些沉默的旅人，大多低着头喝闷酒，' +
        '在这种地方，没人多问别人的来历和去处。' +
        '空气里是酒气、汗味和炭火的混合气息，' +
        '倒也算得上温暖——至少比外面的寒风好得多。',
    );
    this.set('coordinates', { x: -1, y: 0, z: 0 });
    this.set('exits', {
      east: 'area/frost-pass/south-gate',
      south: 'area/frost-pass/shrine',
    });
  }
}
