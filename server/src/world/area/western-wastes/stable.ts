/**
 * 黄沙驿·马厩驼圈 — 牲畜暂歇之所
 * 坐标: (0, -1, 0)
 * 骆驼与马匹混养，驼夫在此照料牲口、修补鞍具
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class WesternWastesStable extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '黄沙驿·马厩驼圈');
    this.set(
      'long',
      '木栅围起的露天畜栏里，骆驼和马匹各占一边，彼此井水不犯河水。' +
        '骆驼们跪卧在沙地上反刍，偶尔扭过长长的脖子，用那双居高临下的眼睛打量来人。' +
        '几匹从中原来的马被热风吹得有些恹恹，挤在一块麻布帐篷的阴影下。' +
        '地上散落着干草和半截绳头，空气中弥漫着牲畜的气味和皮革上的油脂香。' +
        '驼圈角落堆着鞍具和水囊，一个驼夫正蹲着给骆驼修蹄，动作稳而熟练。',
    );
    this.set('coordinates', { x: 0, y: -1, z: 0 });
    this.set('exits', {
      south: 'area/western-wastes/east-gate',
      west: 'area/western-wastes/caravansary',
      north: 'area/western-wastes/dune-lookout',
    });
  }
}
