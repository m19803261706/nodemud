/**
 * 海路·礁石道 — 海路·东海段
 * 坐标: (3,0,0)
 * 野怪房（礁石蟹），退潮时才能通行的礁石小路
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadEasternReefPath extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '海路·礁石道');
    this.set(
      'long',
      '退潮时才能露出的礁石小路，黑色玄武岩表面覆着湿滑的苔藓，' +
        '每一步都需要小心翼翼地测试脚下的着力点。' +
        '礁石间的水洼里生活着各种海洋生物：小鱼、海葵、海胆，' +
        '还有横行霸道的礁石蟹，它们挥动大螯，对入侵者毫不退让。' +
        '远处的潮汐港已依稀可见，低矮的港口建筑在雾气中若隐若现，' +
        '偶尔能听到港口方向传来的喧嚣声和锚链拖拽的声响。',
    );
    this.set('coordinates', { x: 3, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/road-eastern/sea-cliff',
      east: 'area/eastern-sea/harbor-gate',
    });
  }
}
