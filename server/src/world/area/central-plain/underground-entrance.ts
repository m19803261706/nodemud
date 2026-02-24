/**
 * 洛阳废都·暗道入口 — 铁匠巷尽头的地下通道入口
 * 坐标: (-1, 3, 0)
 * 鼠爷把守，收费入内，地下湿冷气息弥漫
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class CentralPlainUndergroundEntrance extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '洛阳废都·暗道入口');
    this.set(
      'long',
      '铁匠巷尽头一堵倒塌的墙后面，露出一截向下延伸的石阶，' +
        '阶面被磨得光滑发亮，说明常有人走，而且走了很久。' +
        '入口边缘潦草地堆着几块砖，像是有人试图遮掩又放弃了。' +
        '入口旁坐着一个自称「鼠爷」的瘦小男人，' +
        '缩在阴影里嗑瓜子，眼睛在暗处发着两点幽光，像真的老鼠。' +
        '他不挡道，只是看着你，等你开口。' +
        '从石阶里涌上来一股地下特有的湿冷气息，' +
        '带着泥土、铜锈与某种说不清楚的陈旧气味。',
    );
    this.set('coordinates', { x: -1, y: 3, z: 0 });
    this.set('exits', {
      north: 'area/central-plain/blacksmith-alley',
      east: 'area/central-plain/south-gate',
    });
  }
}
