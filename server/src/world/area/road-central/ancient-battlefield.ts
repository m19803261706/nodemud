/**
 * 官道·古战场 — 官道中原段
 * 坐标: (0, 5, 0)
 * 一片当年两军交锋的旧战场，荒草间偶见锈蚀的兵刃
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadCentralAncientBattlefield extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '官道·古战场');
    this.set(
      'long',
      '官道穿过一片平坦而空旷的荒地，脚下的泥土颜色比别处深沉，' +
        '据说是当年鲜血浸透了黄土，至今不曾褪去。' +
        '路边的草丛里偶尔能翻出锈蚀的箭簇和残断的枪头，' +
        '有些已经和泥土长在了一起，再也分不开。' +
        '一座孤零零的石碑歪在路旁，碑面光滑，碑文却被人故意凿去，' +
        '不知是哪朝哪代的人不愿后人记起这场战事。' +
        '风从空旷处卷过来，呜呜作响，好像这片土地还在低声诉说什么。',
    );
    this.set('coordinates', { x: 0, y: 5, z: 0 });
    this.set('exits', {
      north: 'area/road-central/ruined-village',
      south: 'area/road-central/relay-station',
    });
  }
}
