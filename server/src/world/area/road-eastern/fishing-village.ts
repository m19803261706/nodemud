/**
 * 海路·渔村码头 — 海路·东海段
 * 坐标: (6,0,0)
 * 一个小渔村的码头，渔民生活的日常场景
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadEasternFishingVillage extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '海路·渔村码头');
    this.set(
      'long',
      '一个小渔村依山面海而建，十来间矮房子错落有致，' +
        '墙壁被海风侵蚀得斑驳不堪，但屋前晾着的渔网整整齐齐，' +
        '看得出主人是个利落的人。' +
        '码头上停着五六条小渔船，船身被刷了桐油，泛着暗沉的光泽。' +
        '几个渔妇蹲在码头边清理刚打上来的鱼获，鱼鳞飞溅，' +
        '海鸥在头顶盘旋，时不时俯冲下来叼走一条小鱼。' +
        '空气中鱼腥味和海水的咸味混在一起，是沿海讨生活的人最熟悉的气味。',
    );
    this.set('coordinates', { x: 6, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/road-eastern/pirate-fork',
      east: 'area/road-eastern/seaside-boardwalk',
    });
  }
}
