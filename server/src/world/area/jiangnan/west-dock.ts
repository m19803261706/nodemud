/**
 * 烟雨镇·西码头 — 烟雨镇
 * 坐标: (0,0,0)
 * 镇子入口，货运码头
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class JiangnanWestDock extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '烟雨镇·西码头');
    this.set(
      'long',
      '青石砌成的码头延伸入运河，几艘乌篷船用绳子系在铁环上，随水波轻轻摇曳。' +
        '搬运工来来往往，挑着装满货物的担子，脚步沉稳，汗水浸透了布衫。' +
        '码头边堆放着各式货物：布匹、瓷器、茶叶，还有装着活鱼的木桶，' +
        '偶尔传来几声鱼尾拍打木板的声响。' +
        '一块木牌挂在码头入口：「卸货时段，闲人勿扰。」',
    );
    this.set('coordinates', { x: 0, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/road-jiangnan/east-end',
      east: 'area/jiangnan/main-canal',
    });
  }
}
