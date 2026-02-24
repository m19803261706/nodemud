/**
 * 丝路·胡杨枯林 — 西域丝路
 * 坐标: (-7, 0, 0)
 * 死去的胡杨林，枯木矗立如白骨
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadWesternPoplarDeadwood extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '丝路·胡杨枯林');
    this.set(
      'long',
      '丝路两旁忽然出现了树——但全是死的。' +
        '成片的胡杨枯木矗立在沙地里，树皮剥落，枝干扭曲，' +
        '像一群死去多年却不肯倒下的老兵。' +
        '它们曾经是这片土地最后的守卫者，据说胡杨「生而千年不死，死而千年不倒，倒而千年不朽」，' +
        '如今看来确实如此。' +
        '枯白的树干在烈日下反射着刺眼的光，远看像是一片白骨的森林。' +
        '偶尔有乌鸦落在枯枝上，发出沙哑的叫声，然后又扑棱棱飞走，' +
        '仿佛这片枯林连鸟都嫌弃，不肯久留。',
    );
    this.set('coordinates', { x: -7, y: 0, z: 0 });
    this.set('exits', {
      east: 'area/road-western/oasis-ruin',
      west: 'area/road-western/ruined-wall',
    });
  }
}
