/**
 * 洛阳废都·守卫营房 — 承天朝留守士兵驻地
 * 坐标: (-1, -1, 0)
 * 编制缩减至十余人，物资匮乏，士气低落
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class GuardBarracks extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '洛阳废都·守卫营房');
    this.set(
      'long',
      '承天朝留守废都的卫兵营房，满打满算只剩十几人编制，却占着一整排屋子，空旷得像个笑话。' +
        '木架上稀稀拉拉挂着几副铠甲，皮带已经硬化开裂，兵器架上大半位置空着，剩下的刀枪也需要重新开刃。' +
        '角落里堆着几袋干粮和一摞柴火，门口贴着一张值班表，字迹工整，但写表的人早已不知去向。' +
        '潮湿的泥土味与陈旧的汗气混在一起，是一支军队残余的气味。',
    );
    this.set('coordinates', { x: -1, y: -1, z: 0 });
    this.set('exits', {
      east: 'area/central-plain/governor-mansion',
      south: 'area/central-plain/collapsed-tower',
    });
  }
}
