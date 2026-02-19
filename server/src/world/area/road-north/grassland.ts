/**
 * 官道·草原边缘 — 官道北境段
 * 坐标: (0, -3, 0)
 * 官道尽头，草原豁然开朗，草原劫匪出没之地
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadNorthGrassland extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '官道·草原边缘');
    this.set(
      'long',
      '官道在此戛然而止，脚下的夯土路面消融于无边的草原之中。' +
        '眼前豁然开朗——枯黄的草甸一直铺展到天际，' +
        '天际线低而平，大得近乎压迫。' +
        '风从草原深处席卷而来，带着野兽皮毛的腥气和遥远营地的烟火气息。' +
        '草丛里偶有黑影晃动，是伏击商旅的惯手——北漠游骑劫匪。' +
        '他们熟知这片草原的每一道沟壑，来去如风，杀人越货后消失于天地之间。' +
        '路边有几具被草没了半截的白骨，那是没能通过这里的倒霉旅人。',
    );
    this.set('coordinates', { x: 0, y: -3, z: 0 });
    this.set('exits', {
      south: 'area/road-north/frozen-trail',
      north: 'area/road-north/north-end',
    });
  }
}
