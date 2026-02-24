/**
 * 潮汐港·渔人栈桥 — 渔民作业区
 * 坐标: (2, 1, 0)
 * 腥味最浓的地方，渔网与鱼筐堆积如山
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class EasternSeaFishingDock extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '潮汐港·渔人栈桥');
    this.set(
      'long',
      '一条窄长的木栈桥伸入浅水区，桥面被鱼血和海水浸得又滑又腻。' +
        '栈桥两侧挂满了渔网，网上的贝壳和海藻在风中摇晃，散发出浓烈的腥味。' +
        '几个老渔民蹲在桥头补网，手指粗糙得像树皮，' +
        '嘴里叼着自卷的旱烟，烟雾在海风中转瞬即逝。' +
        '桥下拴着十几条小渔船，船底长满了青苔，' +
        '随着潮水的起伏轻轻撞击着木桩，发出沉闷的声响。' +
        '栈桥尽头搁着一座用渔网和竹竿搭成的棚子，里面堆满了鱼筐和盐缸。',
    );
    this.set('coordinates', { x: 2, y: 1, z: 0 });
    this.set('exits', {
      north: 'area/eastern-sea/net-workshop',
      west: 'area/eastern-sea/wharf',
      south: 'area/eastern-sea/salt-flat',
      east: 'area/eastern-sea/shipwreck-graveyard',
    });
  }
}
