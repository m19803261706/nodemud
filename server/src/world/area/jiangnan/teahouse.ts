/**
 * 烟雨镇·听雨茶楼 — 烟雨镇
 * 坐标: (1,-1,0)
 * 沉浸锚点，NPC 顾婉所在，水面意象
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class JiangnanTeahouse extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '烟雨镇·听雨茶楼');
    this.set(
      'long',
      '二楼临水的雅座，窗棂半开，雨丝连绵地飘进来，打湿了窗台的青苔。' +
        '掌柜顾婉穿着一身烟灰色的棉布衫，笑盈盈地走来递上茶单，' +
        '手腕上的碧玉镯在灯光下泛着幽光。' +
        '茶桌上摆着一盏龙井，杯口还冒着细细的热气。' +
        '窗外湖面极静，偶有鱼跃水面，荡出几圈涟漪，又重归平静，' +
        '像是什么秘密被捡起又放下。' +
        '楼下隐约传来商议声，但在茶香里，一切显得遥远而模糊。',
    );
    this.set('coordinates', { x: 1, y: -1, z: 0 });
    this.set('exits', {
      south: 'area/jiangnan/main-canal',
    });
  }
}
