/**
 * 官道·洛阳近郊 — 官道中原段南端
 * 坐标: (0, 4, 0)
 * 衔接官道与洛阳废都北城门
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadCentralSouthEnd extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '官道·洛阳近郊');
    this.set(
      'long',
      '视野豁然开阔，远处城墙的轮廓隐约可见，轮廓残缺，却仍可辨出昔日雄城的气魄。' +
        '空气中飘来炊烟的气息，混着旧城的尘土味道，说不清是哪处还在勉强维持的人家点的火。' +
        '官道两侧土地荒芜，偶有几处野麦田，大约是难民就地垦荒留下的。' +
        '前方不远，洛阳北城门就在那片废墟之中。',
    );
    this.set('coordinates', { x: 0, y: 4, z: 0 });
    this.set('exits', {
      north: 'area/road-central/crossroads',
      south: 'area/central-plain/north-gate',
    });
  }
}
