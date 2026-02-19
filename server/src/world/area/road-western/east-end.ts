/**
 * 丝路·荒原入口 — 西域丝路东端
 * 坐标: (0, 0, 0)
 * 绿色消失之处，与洛阳废都残灯酒肆相连
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadWesternEastEnd extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '丝路·荒原入口');
    this.set(
      'long',
      '官道在这里发生了某种微妙的变化——绿色一点点消失，' +
        '草地变成了低矮的灌木，灌木变成了碎石，碎石变成了黄沙。' +
        '天空变得极蓝，蓝得透明，没有一片云，太阳更毒，直接把热气压进皮肤里。' +
        '路边有一处废弃的驼队营地，石头堆成的炉灶已经熄灭，' +
        '地上散落着骆驼粪便和破旧的毡布，看来人离开有一段时间了。' +
        '沿路往西，黄沙天地逐渐展开，是另一个世界。',
    );
    this.set('coordinates', { x: 0, y: 0, z: 0 });
    this.set('exits', {
      east: 'area/central-plain/old-tavern',
      west: 'area/road-western/dusty-wasteland',
    });
  }
}
