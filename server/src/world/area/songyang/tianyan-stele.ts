/**
 * 嵩阳宗·天衍残碑
 * 练功崖以东，一块残破石碑矗立崖边
 * 坐标: (1, -8, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class SongyangTianyanStele extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '天衍残碑');
    this.set(
      'long',
      '一块断裂过半的青石碑立在崖畔，碑面斑驳，隐约可辨数行篆文，笔意古拙苍劲。碑前香炉已冷，地上落着几片枯叶。传闻此碑刻有天衍心法残篇，然碑文大半已不可读。',
    );
    this.set('coordinates', { x: 1, y: -8, z: 0 });
    this.set('exits', {
      west: 'area/songyang/practice-cliff',
    });
  }
}
