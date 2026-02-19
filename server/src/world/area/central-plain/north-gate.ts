/**
 * 洛阳废都·北城门 — 洛阳废都入口
 * 坐标: (0, 0, 0)
 * 守卫盘查进城者，连接官道南端
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class CentralPlainNorthGate extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '洛阳废都·北城门');
    this.set(
      'long',
      '残破的城门洞斜倚着，门楣上"洛阳"二字只剩半边，另半边已随塌落的砖石不知去向。' +
        '城门洞两侧的石墙布满裂缝，攀附着干枯的藤蔓，像是大地本身在用植物将这里重新吞噬。' +
        '一名守卫倚在门旁，神情疲倦，打量着每一个进城的人。' +
        '他身后是一片残垣断壁，昔日的繁华在战火与岁月中化作这片灰白废墟。',
    );
    this.set('coordinates', { x: 0, y: 0, z: 0 });
    this.set('exits', {
      north: 'area/road-central/south-end',
      south: 'area/central-plain/ruins-square',
    });
  }
}
