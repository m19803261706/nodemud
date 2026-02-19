/**
 * 官道·十字路口 — 官道中原段
 * 坐标: (0, 3, 0)
 * 东西南北交汇要道，立有指路石碑
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadCentralCrossroads extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '官道·十字路口');
    this.set(
      'long',
      '东西南北四条路在此交汇，路口中央立着一块指路石碑，' +
        '四面各刻着方向与地名：北面"裂隙镇八十里"，南面"洛阳二十里"，' +
        '东面"嵩山脚下三十里"，西面字迹已模糊难辨，隐约是个已消失的地名。' +
        '有商队在路口歇脚，脚夫们围着石碑猜那块模糊的字写的是哪里。' +
        '时不时有武人策马而过，扬起一阵黄尘。',
    );
    this.set('coordinates', { x: 0, y: 3, z: 0 });
    this.set('exits', {
      north: 'area/road-central/old-bridge',
      south: 'area/road-central/south-end',
      east: 'area/road-jiangnan/west-end',
      northeast: 'area/road-north/south-end',
    });
  }
}
