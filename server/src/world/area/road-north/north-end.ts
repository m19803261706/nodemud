/**
 * 官道·边关近郊 — 官道北境段
 * 坐标: (0, -4, 0)
 * 朔云关城墙已隐约可见，关头旗帜猎猎作响
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadNorthNorthEnd extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '官道·边关近郊');
    this.set(
      'long',
      '向北望去，朔云关的城墙轮廓已清晰可辨，' +
        '灰褐色的石砌城墙厚实而沉默，城头旗帜被北风吹得猎猎作响。' +
        '旗上绣的是承天朝的金龙，只是颜色被风沙褪得有些发白。' +
        '这段路已相对安全——关内的斥候会定期巡视附近，' +
        '偶有持矛的士卒骑马而过，向入关者打量几眼。' +
        '路边有个简陋的茶棚，棚主是个独臂老汉，据说当年就是在守关时丢的那条胳膊。' +
        '他卖的茶水滚烫，是这条路上难得的温热。',
    );
    this.set('coordinates', { x: 0, y: -4, z: 0 });
    this.set('exits', {
      south: 'area/road-north/grassland',
      north: 'area/frost-pass/south-gate',
    });
  }
}
