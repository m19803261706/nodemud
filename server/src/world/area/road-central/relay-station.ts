/**
 * 官道·废驿站 — 官道中原段
 * 坐标: (0, 6, 0)
 * 官道旁一座荒废的驿站，当年的信使歇脚之处
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadCentralRelayStation extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '官道·废驿站');
    this.set(
      'long',
      '路旁立着一座颓败的院落，门楣上的"永安驿"三字被风雨侵蚀得只剩隐约轮廓。' +
        '院墙塌了一半，正门的木板歪挂在铰链上，被风吹得吱呀作响。' +
        '院内还残存着一间勉强能遮风雨的瓦房，门口堆着几捆枯草和劈柴，' +
        '看得出有过路人曾在此暂宿。' +
        '马厩的石槽还在，却早没了马匹的踪影，只有墙角一窝野鸽子咕咕地叫着。' +
        '这驿站在官驿裁撤后便无人打理，如今只剩下一副空架子。',
    );
    this.set('coordinates', { x: 0, y: 6, z: 0 });
    this.set('exits', {
      north: 'area/road-central/ancient-battlefield',
      south: 'area/road-central/crossroads',
    });
  }
}
