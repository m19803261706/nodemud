/**
 * 官道·旧石桥 — 官道中原段
 * 坐标: (0, 2, 0)
 * 采集点：断碑拓片，桥头野怪盘踞
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadCentralOldBridge extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '官道·旧石桥');
    this.set(
      'long',
      '一座年久失修的石桥横跨一条早已干涸的河道，桥面青苔斑驳，' +
        '石缝间长着几株顽强的野草。桥头立着半截石碑，' +
        '碑文大半已被风化，隐约可辨"……功德……万民……"几个字。' +
        '有人说这座桥建于前朝极盛时期，河水干涸后桥也失去了用处，' +
        '只剩石碑还在，记录着一段被遗忘的历史。',
    );
    this.set('coordinates', { x: 0, y: 2, z: 0 });
    this.set('exits', {
      north: 'area/road-central/dusty-road',
      south: 'area/road-central/crossroads',
    });
  }
}
