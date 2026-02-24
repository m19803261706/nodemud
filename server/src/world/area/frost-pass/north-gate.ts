/**
 * 朔云关·北门 — 朔云关
 * 坐标: (0, -4, 0)
 * 面向北漠的城门，常年紧闭，仅在出兵或接收降人时开启
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class FrostPassNorthGate extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '朔云关·北门');
    this.set(
      'long',
      '北门比南门更加厚重，门扇由三层铁木拼合而成，' +
        '外面还钉了一层铁板，刀砍火烧都难以撼动。' +
        '门洞里常年弥漫着一股湿冷的霉味，' +
        '因为这扇门已经很久没有打开过了——除非出兵或接收降人。' +
        '门楣上没有题字，只有一排铁钉和一面破旧的旗帜。' +
        '门洞两侧堆满了沙袋和石块，随时准备封堵。' +
        '站在门缝前，能从门板的缝隙里看到外面——' +
        '灰蒙蒙的天空，枯黄的草甸，以及偶尔掠过的苍鹰。' +
        '据守门的老兵说，每次开门都能闻到北漠特有的腥膻味，' +
        '那是马群和牛羊留在草原上的气息，也是敌人的味道。',
    );
    this.set('coordinates', { x: 0, y: -4, z: 0 });
    this.set('exits', {
      south: 'area/frost-pass/war-camp',
      north: 'area/frost-pass/outpost',
    });
  }
}
