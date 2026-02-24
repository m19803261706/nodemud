/**
 * 洛阳废都·武道场遗址 — 昔日各派切磋之地
 * 坐标: (0, -2, 0)
 * 石台犹在，刀痕剑迹封存着一个武林的记忆，正中裂痕成谜
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class ArenaRuins extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '洛阳废都·武道场遗址');
    this.set(
      'long',
      '昔日洛阳各派切磋武学的圆形武道场，石台边缘残缺，轮廓却依然清晰，像一枚被折断的铜钱。' +
        '地面密密麻麻刻满刀痕剑迹，有些深达半寸，不知是什么境界的内力才能在青石上留下这样的印记。' +
        '看守老刀坐在台下的石墩上，慢慢磨着一把缺口的环首刀，他左手少了两根手指，磨刀的姿势却浑然不受影响。' +
        '石台正中有一道一丈长的裂痕，像是被某种巨力劈开，裂缝底部隐约透出微弱的光，不知是石英的折射，还是别的什么。',
    );
    this.set('coordinates', { x: 0, y: -2, z: 0 });
    this.set('exits', {
      south: 'area/central-plain/governor-mansion',
    });
  }
}
