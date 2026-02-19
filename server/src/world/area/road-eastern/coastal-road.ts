/**
 * 海路·沿海小径 — 海路·东海段
 * 坐标: (1,0,0)
 * 采集点（海藻），悬崖边窄路
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadEasternCoastalRoad extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '海路·沿海小径');
    this.set(
      'long',
      '悬崖边的一条窄路，宽不足三尺，一侧是嶙峋的岩壁，另一侧便是深不见底的大海。' +
        '浪花拍打岩石，发出震耳的轰鸣，水雾弥漫，打湿了衣襟。' +
        '脚下的路面布满了海风侵蚀的坑洼，走快了容易踩空。' +
        '崖壁上附着大片绿色的海藻，随海风轻轻颤动，' +
        '潮退时候可以采集，据说晒干后可以入药，也可以做汤食用。' +
        '远处海面上，偶尔有轮廓模糊的船影一闪而过。',
    );
    this.set('coordinates', { x: 1, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/road-eastern/west-end',
      east: 'area/road-eastern/sea-cliff',
    });
  }
}
