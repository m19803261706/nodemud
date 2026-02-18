/**
 * 嵩阳宗·戒律堂
 * 执事院南侧，执掌门规戒律之所
 * 坐标: (1, -5, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class SongyangDisciplineHall extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '嵩阳宗·戒律堂');
    this.set(
      'long',
      '堂内正壁悬挂门规十二条，字迹端正如刀刻。两侧立着戒尺架，乌木戒尺磨得发亮。堂中气氛肃穆，连窗外鸟鸣都似被压低了几分。角落里摆着一张檀木案，案上整齐地码放着数本厚册，记录着历年犯戒弟子的处分。',
    );
    this.set('coordinates', { x: 1, y: -5, z: 0 });
    this.set('exits', {
      north: 'area/songyang/deacon-court',
    });
  }
}
