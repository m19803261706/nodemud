/**
 * 山路·蛮疆入口 — 蛮疆山路北端
 * 坐标: (0, 0, 0)
 * 官道断裂处，与洛阳废都万宗广场相连
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadNanjiangNorthEnd extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '山路·蛮疆入口');
    this.set(
      'long',
      '官道在此戛然而断，青石路面裂成碎块，被杂草和蕨叶从缝隙里撑开。' +
        '往南走，只剩山民踩出的泥土小径，两侧的树木迅速变得粗大茂密，' +
        '林子越来越深，光线越来越暗，空气里混着腐叶和野花的气息。' +
        '路旁有一块歪斜的石碑，上刻「化外之地，行者自慎」，字迹已被苔藓侵蚀大半。',
    );
    this.set('coordinates', { x: 0, y: 0, z: 0 });
    this.set('exits', {
      north: 'area/central-plain/ruins-square',
      south: 'area/road-nanjiang/bamboo-path',
    });
  }
}
