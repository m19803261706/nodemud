/**
 * 洛阳废都·藏书阁残迹 — 许鹤年守护的残存典籍之地
 * 坐标: (2, 2, 0)
 * 二楼坍塌，许鹤年从废墟中抢救残书，不准带走但允许阅读
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class CentralPlainOldLibrary extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '洛阳废都·藏书阁残迹');
    this.set(
      'long',
      '曾经藏书万卷的阁楼，如今只剩一楼还算完整，二楼以上早已坍塌，' +
        '粗木书架横七竖八地散落一地，压住了无数散页，有的已经腐朽成纸浆。' +
        '许鹤年是这里唯一的"管理员"——他从废墟中一卷卷地抢救残书，' +
        '按自己的分类法整齐码放在还能用的架子上，每卷都夹着竹签，' +
        '写着「可读」或「待修」，字迹工整得像是某种虔诚的仪式。' +
        '他不许人拿走书，但允许在此阅读，角落里铺着一张草席和一盏小油灯——' +
        '那是他的全部家当，他就住在这里，日夜守着这些残卷。',
    );
    this.set('coordinates', { x: 2, y: 2, z: 0 });
    this.set('exits', {
      west: 'area/central-plain/temple-ruins',
      north: 'area/central-plain/noble-quarter',
    });
  }
}
