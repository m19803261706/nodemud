/**
 * 山路·溪谷小道 — 蛮疆山路
 * 坐标: (0, 2, 0)
 * 溪涧蜿蜒，青苔湿滑，需趟水而过
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadNanjiangCreekTrail extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '山路·溪谷小道');
    this.set(
      'long',
      '山路在此沿溪涧而行，一条不宽不窄的山溪从左侧崖壁间淌出，' +
        '水流清澈却湍急，溪底的鹅卵石被冲刷得圆润光滑，在水下闪着暗绿色的光。' +
        '小径有好几段被溪水漫过，石面上长满了青苔，走上去滑得站不住脚。' +
        '溪边丛生着蕨类和凤尾竹，叶片上凝着细密的水珠。' +
        '溪水的哗哗声盖过了林中其他声响，' +
        '只有偶尔从上游漂来的落叶，提醒人这条溪的源头还在更深的山里。',
    );
    this.set('coordinates', { x: 0, y: 2, z: 0 });
    this.set('exits', {
      north: 'area/road-nanjiang/bamboo-path',
      south: 'area/road-nanjiang/vine-bridge',
    });
  }
}
