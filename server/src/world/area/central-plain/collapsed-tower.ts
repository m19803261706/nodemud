/**
 * 洛阳废都·倒塌角楼 — 城墙与城内的过渡地带
 * 坐标: (-1, 0, 0)
 * 角楼倒塌后的废墟，有逃兵在断墙后搭建窝棚藏身
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class CollapsedTower extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '洛阳废都·倒塌角楼');
    this.set(
      'long',
      '城墙角楼轰然倒塌之后，留下这片砖石乱野，碎砖块散落一地，有些已经被泥土和杂草半埋。' +
        '断墙后有人搭了一个简易窝棚，用的是破布、断木和几块勉强完整的城砖——是逃兵藏身的地方，潦草而局促。' +
        '站在这里能同时望见城内的废墟和城外的荒芜，两种萧条之间只隔着一段残缺的墙基，仿佛世界在这里折叠了。' +
        '风穿过碎砖的缝隙，发出低沉的呜咽，说不清是城在叹气，还是藏在窝棚里的人。',
    );
    this.set('coordinates', { x: -1, y: 0, z: 0 });
    this.set('exits', {
      east: 'area/central-plain/north-gate',
      north: 'area/central-plain/guard-barracks',
      south: 'area/central-plain/old-tavern',
      west: 'area/central-plain/west-wall',
    });
  }
}
