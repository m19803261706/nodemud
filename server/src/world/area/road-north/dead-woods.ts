/**
 * 官道·枯树林 — 官道北境段
 * 坐标: (0, -2, 0)
 * 一片枯死的树林，树干灰白如骨，终年不见绿意
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadNorthDeadWoods extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '官道·枯树林');
    this.set(
      'long',
      '官道穿过一片死寂的树林，两旁全是枯死的白桦，' +
        '树干上的皮早已剥落殆尽，露出灰白的木质，远看像是一根根竖立的骨头。' +
        '枝杈光秃秃的，在风中碰撞，发出干燥的咔嗒声，像有人在暗处敲打什么。' +
        '地上铺满厚厚一层腐叶和碎枝，踩上去沙沙作响。' +
        '阳光很难穿透交错的枝杈，即便是白天，林中也笼着一层灰蒙蒙的暮色。' +
        '有人说这片林子是被一场寒潮冻死的，也有人说是地下的水源断了。',
    );
    this.set('coordinates', { x: 0, y: -2, z: 0 });
    this.set('exits', {
      south: 'area/road-north/wind-pass',
      north: 'area/road-north/frozen-trail',
    });
  }
}
