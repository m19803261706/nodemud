/**
 * 官道·路边茶摊 — 官道中原段
 * 坐标: (0, 2, 0)
 * 路边歇脚处，一位老翁支起的简陋茶摊
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadCentralTeaStall extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '官道·路边茶摊');
    this.set(
      'long',
      '路边支着一顶发黄的油布棚子，下面摆了几条歪歪斜斜的长凳和一张矮桌。' +
        '一个铜壶架在土灶上，冒着细细的白烟，空气中弥漫着粗茶的苦涩香气。' +
        '棚柱上挂着一面小布旗，上书"粗茶一文"四个歪歪扭扭的字。' +
        '官道上来往的行人偶尔会在此停脚，灌几口热水润润喉咙再赶路。' +
        '茶摊旁有几棵矮槐树，枝干虬曲，勉强遮出一片荫凉。',
    );
    this.set('coordinates', { x: 0, y: 2, z: 0 });
    this.set('exits', {
      north: 'area/road-central/dusty-road',
      south: 'area/road-central/old-bridge',
    });
  }
}
