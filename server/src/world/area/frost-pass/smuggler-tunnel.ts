/**
 * 朔云关·暗道 — 朔云关
 * 坐标: (-1, -2, -1)
 * 地牢西侧的秘密通道，走私客和间谍的暗中通行之路
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class FrostPassSmugglerTunnel extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '朔云关·暗道');
    this.set(
      'long',
      '一条狭窄的地道，仅容一人弯腰通过，两侧的土壁被加固过，' +
        '用木板和石块撑着，但仍有些地方渗着水，踩上去泥泞打滑。' +
        '地道里没有灯，漆黑一片，走在里面只能靠手摸墙壁前行。' +
        '空气混浊而闷热，带着泥土和地下水的潮气。' +
        '隔几步就能摸到墙壁上刻的箭头标记，' +
        '是走惯了这条路的人留下的指引。' +
        '地上散落着一些痕迹：半截蜡烛、踩碎的干粮渣、' +
        '和一小截染了血的布条。' +
        '据说这条暗道的另一头通向城外的某处荒丘，' +
        '但入口被巧妙地伪装成了一个坍塌的洞穴，外人极难发现。',
    );
    this.set('coordinates', { x: -1, y: -2, z: -1 });
    this.set('exits', {
      east: 'area/frost-pass/dungeon',
    });
  }
}
