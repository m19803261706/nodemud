/**
 * 洛阳废都·殿下暗室 — 断壁残殿地板下的门派密室
 * 坐标: (1, 1, -1)
 * 阵法刻痕、机关遗迹、锈死的石箱，硕鼠出没
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class CentralPlainHiddenCellar extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '洛阳废都·殿下暗室');
    this.set(
      'long',
      '从断壁残殿地板上一块松动的石板掀开暗门，沿铁梯而下，' +
        '来到这间隐藏于地下的密室。' +
        '石壁上布满刻痕，线条繁复有序，是某种阵法的纹路，' +
        '但关键节点已被人用凿子硬生生磨平，令其永久失效。' +
        '地面铺设的铜管与石槽暗示此处曾有精密的机关装置，' +
        '如今所有活动件都已拆除，只留下槽痕和固定孔。' +
        '角落靠墙排列着三口石箱，锁鼻上的铜锁已经锈死，' +
        '撬不开，也打不烂——不知里头是什么，也不知还值不值得费力。' +
        '偶尔能听到废都硕鼠在石箱后面来回跑动的声音，铜管里回响着细碎的爪击声。',
    );
    this.set('coordinates', { x: 1, y: 1, z: -1 });
    this.set('exits', {
      up: 'area/central-plain/broken-hall',
    });
  }
}
