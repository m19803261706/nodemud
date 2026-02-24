/**
 * 海路·海风崖 — 海路·东海段
 * 坐标: (4,0,0)
 * 崖顶观海台，视野开阔，可远眺整片东海
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadEasternWindCliff extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '海路·海风崖');
    this.set(
      'long',
      '道路攀上一处突出海面的高崖，崖顶是一片被海风削平的岩地，' +
        '站在上面整片东海尽收眼底，碧蓝的海面一望无际，与天际线浑然一体。' +
        '崖顶风势极大，猎猎作响，人若站不稳便有被吹落的危险。' +
        '有人在崖边立了一块石碑，上面刻着"望海台"三个大字，字迹遒劲，' +
        '旁边还有几行小字，记载着此处是古时渔民祭海的场所。' +
        '崖下浪涛拍岸，激起数丈高的白沫，声势骇人。',
    );
    this.set('coordinates', { x: 4, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/road-eastern/sea-cliff',
      east: 'area/road-eastern/pirate-fork',
    });
  }
}
