/**
 * 烟雨镇·运河街 — 烟雨镇
 * 坐标: (1,0,0)
 * 沿运河主街，商铺林立，沉浸锚点在北侧茶楼
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class JiangnanMainCanal extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '烟雨镇·运河街');
    this.set(
      'long',
      '沿运河而建的主街是烟雨镇的命脉，两侧商铺鳞次栉比，' +
        '布庄、药铺、糕点摊依次排开，叫卖声此起彼伏却不显嘈杂。' +
        '运河就在街边流淌，水面倒映着粉墙黛瓦，' +
        '偶有小船穿过拱桥，船尾的涟漪将倒影荡散又重新聚拢。' +
        '街角处有棵大榕树，树根已将青石板顶起，' +
        '一个落魄书生靠着树干，手里捏着一壶廉价的清酒，神情恍惚。' +
        '北边临水而建的二楼飘来茶香，门口挂着"听雨茶楼"的灯笼。',
    );
    this.set('coordinates', { x: 1, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/jiangnan/west-dock',
      north: 'area/jiangnan/teahouse',
      east: 'area/jiangnan/east-dock',
    });
  }
}
