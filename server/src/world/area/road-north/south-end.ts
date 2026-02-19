/**
 * 官道·北境入口 — 官道北境段
 * 坐标: (0, 0, 0)
 * 中原官道向北的起点，气温开始下降，草色由绿转黄
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadNorthSouthEnd extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '官道·北境入口');
    this.set(
      'long',
      '官道在此跨入北境，脚下黄土路面开始混入细碎的白霜。' +
        '路边的野草颜色由绿转黄，间或有几株枯败的灌木在风中颤抖。' +
        '迎面吹来的风比中原冷了不止一分，带着说不清的荒凉气息。' +
        '偶有行商从北方归来，驮马蹄上沾着厚实的霜泥，面色都有些凝重。' +
        '路边立着一块残破的界碑，上书"北境"二字，笔划已被风沙剥蚀大半。',
    );
    this.set('coordinates', { x: 0, y: 0, z: 0 });
    this.set('exits', {
      southwest: 'area/road-central/crossroads',
      north: 'area/road-north/wind-pass',
    });
  }
}
