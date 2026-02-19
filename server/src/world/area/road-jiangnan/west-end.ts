/**
 * 水路·渡口 — 水路·江南段
 * 坐标: (0,0,0)
 * 中原官道与江南水路的衔接处，路况与气候悄然转变
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadJiangnanWestEnd extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '水路·渡口');
    this.set(
      'long',
      '脚下的黄土路悄然变为灰青色石板，缝隙中长着细细的苔藓。' +
        '路边出现了用碎石砌成的水渠，清澈的水汩汩流淌，带走了中原的干燥气息。' +
        '空气里多了一丝湿润，像是有人在附近洗了衣物，或者刚下过一场细雨。' +
        '一块风化的石碑斜立路旁，上书"入江南地界，行人请收刀"，字迹已经半模糊。' +
        '这里是中原与江南的分界，往西是黄尘漫道，往东是烟雨水乡。',
    );
    this.set('coordinates', { x: 0, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/road-central/crossroads',
      east: 'area/road-jiangnan/willow-road',
    });
  }
}
