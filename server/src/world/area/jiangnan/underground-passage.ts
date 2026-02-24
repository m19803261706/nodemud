/**
 * 烟雨镇·水下暗道 — 走私通道与情报交易点
 * 坐标: (2, 5, -1)
 * 地下密室，暗河流淌，见不得光的交易在此进行
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class JiangnanUndergroundPassage extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '烟雨镇·水下暗道');
    this.set(
      'long',
      '沿着湿滑的石阶往下走了二十几步，眼前豁然开朗。' +
        '这是一条依着运河暗渠挖出来的地道，宽可并行两人，' +
        '顶上嵌着几颗夜明珠，发出幽幽的青白色光芒。' +
        '脚下是石板路，两侧是齐腰高的石墙，墙外便是暗渠的流水，' +
        '水声潺潺，在密闭的空间里被放大成低沉的回响。' +
        '石墙上每隔几步便有一个壁龛，龛里放着防水的油灯。' +
        '暗道深处传来低低的交谈声和银两碰撞的脆响，' +
        '这里是烟雨镇水面之下的另一个世界。',
    );
    this.set('coordinates', { x: 2, y: 5, z: -1 });
    this.set('exits', {
      up: 'area/jiangnan/dark-alley',
    });
  }
}
