/**
 * 丝路·黄沙漫道 — 西域丝路第二段
 * 坐标: (-1, 0, 0)
 * 黄沙漫天，靠路边石堆辨别方向，沙漠强盗出没
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadWesternDustyWasteland extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '丝路·黄沙漫道');
    this.set(
      'long',
      '黄沙漫天，风一起，细沙如流水般在地面滑动，' +
        '路面早已被沙覆盖，只能靠路旁每隔一段距离堆起的石堆辨别方向。' +
        '沙粒打在脸上有细微的刺痛感，眼睛眯起来才能睁开。' +
        '远处的地平线在热浪中颤抖扭曲，分不清是真实的山丘还是海市蜃楼。' +
        '周围没有任何遮蔽，感觉自己完全暴露在天地之间——' +
        '这意味着你也能被远处的人看见。',
    );
    this.set('coordinates', { x: -1, y: 0, z: 0 });
    this.set('exits', {
      east: 'area/road-western/east-end',
      west: 'area/road-western/sandstorm-pass',
    });
  }
}
