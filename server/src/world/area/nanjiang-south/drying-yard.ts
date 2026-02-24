/**
 * 雾岚寨·晒药场 — 草药加工晾晒
 * 坐标: (2, 1, 0)
 * 药棚后方的开阔空地，用于晾晒和加工草药
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class NanjiangSouthDryingYard extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '雾岚寨·晒药场');
    this.set(
      'long',
      '药棚后面是一片开阔的平地，几十个竹编的簸箕整齐地排列在石板上，' +
        '每个簸箕里摊着不同的草药——有的翠绿如新，有的已经晒成深褐色。' +
        '一排木架上挂着成捆的药草，在山风中轻轻摇摆，散发出浓烈而复杂的药香。' +
        '角落里有一个石臼，臼壁被研磨得光滑发亮，旁边放着几只陶罐，' +
        '罐口用蜡封住，不知道装的是药还是别的什么。' +
        '有几只色彩斑斓的蝴蝶围着药草飞舞，倒是给这片药场添了几分生趣。' +
        '南边有一条隐蔽的石阶，通向山壁上一个天然洞穴。',
    );
    this.set('coordinates', { x: 2, y: 1, z: 0 });
    this.set('exits', {
      west: 'area/nanjiang-south/herb-hut',
      south: 'area/nanjiang-south/gu-cave',
    });
  }
}
