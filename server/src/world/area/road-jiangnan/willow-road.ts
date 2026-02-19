/**
 * 水路·柳堤小道 — 水路·江南段
 * 坐标: (1,0,0)
 * 野怪房，两岸垂柳夹道，水贼出没
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadJiangnanWillowRoad extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '水路·柳堤小道');
    this.set(
      'long',
      '两岸垂柳依依，细长的枝条低垂至水面，随风轻拂，像是有人在轻轻梳理水草。' +
        '石板路已被水气浸润，踩上去微微发滑，鞋底沾着青苔的气味。' +
        '远处传来悠扬的渔歌，和着水中木桨的吱呀声，却听不清歌词，' +
        '只隐约感受到一种说不清是快乐还是惆怅的调子。' +
        '芦苇丛在道路两侧时隐时现，风一吹便发出窸窸窣窣的声响，像是藏着什么人。',
    );
    this.set('coordinates', { x: 1, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/road-jiangnan/west-end',
      east: 'area/road-jiangnan/misty-bridge',
    });
  }
}
