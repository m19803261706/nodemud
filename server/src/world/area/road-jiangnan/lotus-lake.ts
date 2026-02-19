/**
 * 水路·莲花湖 — 水路·江南段
 * 坐标: (3,0,0)
 * 采集点（莲根须），视野开阔，远眺烟雨镇
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadJiangnanLotusLake extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '水路·莲花湖');
    this.set(
      'long',
      '湖面铺满了宽阔的莲叶，叶片上滚动着饱满的水珠，在晨光里闪出碎银般的光芒。' +
        '几艘采莲船轻轻荡在水面，船娘俯身伸手，将莲蓬一一收入竹篓，' +
        '偶尔对岸传来呼应的吆喝声，悠扬而懒散。' +
        '湖边的道路变得泥泞，踩下去会陷进去半寸，' +
        '莲根在水下盘根错节，据说挖来晒干可作药引。' +
        '对岸隐约可见粉墙黛瓦的轮廓，炊烟从高处飘散，那便是烟雨镇了。',
    );
    this.set('coordinates', { x: 3, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/road-jiangnan/misty-bridge',
      east: 'area/road-jiangnan/east-end',
    });
  }
}
