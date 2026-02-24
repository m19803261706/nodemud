/**
 * 雾岚寨·祭坛 — 部落祭祀圣地
 * 坐标: (-1, 2, 0)
 * 族人祭天祈福、举行重要仪式的场所
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class NanjiangSouthAltar extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '雾岚寨·祭坛');
    this.set(
      'long',
      '一块巨大的青石被人工凿成平台，石面上刻满了密密麻麻的纹路，' +
        '有蛇纹、鸟纹、太阳纹，也有一些谁也辨认不出的古老符号。' +
        '青石四角各立着一根木桩，桩顶插着鸟羽和兽骨，用红绳系着，' +
        '山风一吹便发出呜呜的声响，像是远古的呼唤。' +
        '祭坛前方是一个浅浅的石坑，坑底有烧焦的痕迹和残留的灰烬——' +
        '那是祭祀时焚烧供品留下的。空气中残存着一种说不清的香气，' +
        '不是寻常的檀香或松脂，更像是某种特殊草药燃烧后的余味。' +
        '祭坛周围的地面被打扫得干干净净，不见一片落叶。',
    );
    this.set('coordinates', { x: -1, y: 2, z: 0 });
    this.set('exits', {
      north: 'area/nanjiang-south/council-hall',
      east: 'area/nanjiang-south/spirit-tree',
      west: 'area/nanjiang-south/lusheng-terrace',
    });
  }
}
