/**
 * 丝路·绿洲废墟 — 西域丝路第四段
 * 坐标: (-3, 0, 0)
 * 干涸绿洲，太古纪石雕残片，采集点：血玉砂，沙蝎出没
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadWesternOasisRuin extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '丝路·绿洲废墟');
    this.set(
      'long',
      '这里曾经是一处绿洲，痕迹还在——几棵枯树的根系还没有完全腐烂，' +
        '地面有一口沙井，用绳子放下去，沙桶会触到硬邦邦的沙底，水脉早已断绝。' +
        '废墟散落着残砖和风化的泥坯墙，还有更古老的遗存：' +
        '几块石雕残片半埋在沙中，雕刻着如今的任何一种文字都无法辨认的纹样，' +
        '据说是太古纪留下来的，那时候这里还是繁盛之地。' +
        '沙地里散落着暗红色的细砂，是西域特有的血玉砂，据说可以入药炼器。',
    );
    this.set('coordinates', { x: -3, y: 0, z: 0 });
    this.set('exits', {
      east: 'area/road-western/sandstorm-pass',
      west: 'area/road-western/west-end',
    });
  }
}
