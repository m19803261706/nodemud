/**
 * 嵩阳宗·掌门闭关处
 * 练功崖以北，掌门闭关修炼之所
 * 坐标: (0, -9, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class SongyangMasterRetreat extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '掌门闭关处');
    this.set(
      'long',
      '石门紧闭，门楣上刻着「止观」二字，笔力深沉如斧凿。门缝间隐有檀香渗出，四周静得只闻山风。石阶两侧苔藓厚积，显然已许久无人踏足。',
    );
    this.set('coordinates', { x: 0, y: -9, z: 0 });
    this.set('exits', {
      south: 'area/songyang/practice-cliff',
    });
  }
}
