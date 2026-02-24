/**
 * 烟雨镇·河畔仓库 — 存放货物的仓库区
 * 坐标: (2, 2, 0)
 * 货物堆积如山，偶有可疑人物出没
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class JiangnanWarehouse extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '烟雨镇·河畔仓库');
    this.set(
      'long',
      '几间相连的砖石仓库沿河而建，厚重的木门上挂着铁锁，' +
        '有些已锈死，有些却擦得锃亮——说明里面的货物还在频繁进出。' +
        '门前停着几辆板车，车辙在泥地上压出深深的印痕。' +
        '仓库之间的过道阴暗狭窄，白天也透不进多少光。' +
        '角落里堆着破损的木箱和散落的稻草，空气中有股霉味和陈年茶叶的气息。' +
        '据说有些仓库的主人从不露面，只派人在深夜卸货，' +
        '运的是什么东西，没人敢多问。',
    );
    this.set('coordinates', { x: 2, y: 2, z: 0 });
    this.set('exits', {
      north: 'area/jiangnan/boatyard',
      west: 'area/jiangnan/south-street',
    });
  }
}
