/**
 * 洛阳废都·残破望楼 — 废都最高建筑遗迹
 * 坐标: (1, -1, 0)
 * 木梯摇摇欲坠，登顶可俯瞰全城废墟
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class Watchtower extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '洛阳废都·残破望楼');
    this.set(
      'long',
      '这是废都城中尚存的最高建筑残骸，墙体的青砖在风雨中酥裂，却奇迹般地没有彻底倒塌。' +
        '通往顶层的木梯吱呀作响，每一步都像是它最后的警告，但凑近看，榫卯结构仍然咬合，还能攀登。' +
        '登上残破的顶层，整座废都尽收眼底——断壁残垣在夕阳的余晖里像一张被人撕碎又随手拼回的棋盘，光影在瓦砾间流动。' +
        '远处的官道上偶尔浮现行人的剪影，像是这片死地之外，世界还在继续。',
    );
    this.set('coordinates', { x: 1, y: -1, z: 0 });
    this.set('exits', {
      west: 'area/central-plain/governor-mansion',
      south: 'area/central-plain/patrol-road',
    });
  }
}
