/**
 * 洛阳废都·断壁残殿 — 某派旧殿遗址
 * 坐标: (1, 1, 0)
 * 残存壁画与刀剑划痕，历史线索场景
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class CentralPlainBrokenHall extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '洛阳废都·断壁残殿');
    this.set(
      'long',
      '不知是哪个门派的旧殿，屋顶塌了半边，另半边的梁木奇迹般地还撑着，' +
        '阳光从破洞处斜射进来，照亮了尘埃飞舞的空气。' +
        '墙上依稀可见刀剑划痕，深浅不一，像是某场激烈的交锋留下的痕迹。' +
        '残存的壁画描绘着弟子习武的场景，颜色已经大半剥落，' +
        '但仍能辨出几个持剑人影，身法姿态透着一股肃然的劲道。' +
        '地上的蒲团和香炉早已不知去向，只余几块底座石础，' +
        '见证着这里曾经拥有的庄重。',
    );
    this.set('coordinates', { x: 1, y: 1, z: 0 });
    this.set('exits', {
      west: 'area/central-plain/ruins-square',
    });
  }
}
