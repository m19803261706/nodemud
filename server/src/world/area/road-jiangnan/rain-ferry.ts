/**
 * 水路·雨中渡口 — 水路·江南段
 * 坐标: (7,0,0)
 * 一处常年细雨蒙蒙的渡口，通往烟雨镇的最后一站
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadJiangnanRainFerry extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '水路·雨中渡口');
    this.set(
      'long',
      '不知是地势还是水汽的缘故，这处渡口似乎总笼在一层薄薄的雨幕中。' +
        '渡口用青砖砌了一道矮墙，墙头长着一丛紫色的野花，在雨中轻轻点头。' +
        '码头边泊着两三条乌篷船，船篷上的雨水顺着竹编的缝隙往下淌，' +
        '滴在船舱里，发出清脆而有节奏的声响。' +
        '一个老船夫披着蓑衣坐在船头打盹，竹篙横搁在膝上，' +
        '像是随时准备撑船出发，又像是已经等了很久。',
    );
    this.set('coordinates', { x: 7, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/road-jiangnan/lotus-lake',
      east: 'area/road-jiangnan/east-end',
    });
  }
}
