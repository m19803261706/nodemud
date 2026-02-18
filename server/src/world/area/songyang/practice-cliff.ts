/**
 * 嵩阳宗·练功崖
 * 静思堂以北，历代弟子在此练功的悬崖
 * 坐标: (0, -8, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class SongyangPracticeCliff extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '嵩阳宗·练功崖');
    this.set(
      'long',
      '崖壁陡峭，脚下山风猎猎，远处嵩山群峰层叠如墨。石台上留着无数深浅不一的足印，是历代弟子千百遍踏步留下的痕迹。崖边一株枯松斜出，虬枝如铁。',
    );
    this.set('coordinates', { x: 0, y: -8, z: 0 });
    this.set('exits', {
      south: 'area/songyang/meditation-room',
      east: 'area/songyang/tianyan-stele',
      north: 'area/songyang/master-retreat',
    });
  }
}
