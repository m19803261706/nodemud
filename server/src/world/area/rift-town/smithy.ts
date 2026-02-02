/**
 * 裂隙镇·老周铁匠铺
 * 坐标: (1, -1, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RiftTownSmithy extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '裂隙镇·老周铁匠铺');
    this.set(
      'long',
      '铁匠铺里炉火通红，一个壮实的汉子正抡着铁锤锻打一块烧红的铁块。墙上挂着几柄粗陋的刀剑，虽然做工一般，但胜在结实耐用。据说老周年轻时在北境军镇当过军械匠。',
    );
    this.set('coordinates', { x: 1, y: -1, z: 0 });
    this.set('exits', {
      west: 'area/rift-town/north-street',
    });
  }
}
