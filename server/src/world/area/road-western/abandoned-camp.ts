/**
 * 丝路·废弃营地 — 西域丝路
 * 坐标: (-5, 0, 0)
 * 驼队留下的废弃营地，有篝火痕迹和散落杂物
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadWesternAbandonedCamp extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '丝路·废弃营地');
    this.set(
      'long',
      '路边开阔处有一片被踩实的沙地，是驼队扎营留下的痕迹。' +
        '几块烧黑的石头围成一圈，中间的灰烬早已冷透，' +
        '拨一拨还能看到没有烧尽的骆驼粪和胡杨枝。' +
        '地上散落着断裂的绳索、磨破的麻袋碎片和几根骆驼毛，' +
        '有人用石块垒了个简易的挡风矮墙，半塌了，勉强还有个形状。' +
        '营地边缘插着一根木杆，顶端绑着一条褪色的布条，' +
        '在风中无力地摆动——这是丝路商队的惯例，' +
        '标记此处可以扎营休息，也警告后来者此地并不安全。',
    );
    this.set('coordinates', { x: -5, y: 0, z: 0 });
    this.set('exits', {
      east: 'area/road-western/sandstorm-pass',
      west: 'area/road-western/oasis-ruin',
    });
  }
}
