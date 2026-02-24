/**
 * 黄沙驿·哨卡 — 驿站南端的巡逻哨
 * 坐标: (-2, 2, 0)
 * 防范沙匪和监控来往可疑人物的岗哨
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class WesternWastesGuardPost extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '黄沙驿·哨卡');
    this.set(
      'long',
      '几根粗木桩扎在沙地里，之间拉着绳索和铁丝，围出一个简陋的哨卡。' +
        '一座用石头垒成的矮墙后面，站着或坐着几个面色警惕的守卫。' +
        '他们大多是驿长雇来的本地人，面目粗犷，腰间别着弯刀和水囊。' +
        '哨卡旁边竖着一根高高的旗杆，上面挂着一面褪色的黄旗，' +
        '风沙大的时候旗子被吹得啪啪作响，几乎要撕裂。' +
        '从这里往南看，能隐约看到星轨殿遗址的残垣断壁和苍茫的沙漠边缘。',
    );
    this.set('coordinates', { x: -2, y: 2, z: 0 });
    this.set('exits', {
      north: 'area/western-wastes/curio-shop',
      east: 'area/western-wastes/star-ruins',
    });
  }
}
