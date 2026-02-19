/**
 * 水路·烟雨桥 — 水路·江南段
 * 坐标: (2,0,0)
 * 烟雾笼罩的石拱桥，桥头有卖茶老妪
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadJiangnanMistyBridge extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '水路·烟雨桥');
    this.set(
      'long',
      '一座单孔石拱桥静静笼在薄雾之中，桥身被岁月磨得光滑，' +
        '青苔从两侧缝隙里悄悄往上爬，将石桥染成深深浅浅的绿。' +
        '桥下流水潺潺，声音空旷，像是有人在很深的地方低声说话。' +
        '桥头支着一个简陋的茶摊，一位白发老妪坐在矮凳上打盹，' +
        '茶壶里的水已烧干，袅袅白气散入雾里，分不清哪是茶烟哪是雾气。' +
        '桥栏上有人刻了几个字："此去烟雨里，不知归路期。"',
    );
    this.set('coordinates', { x: 2, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/road-jiangnan/willow-road',
      east: 'area/road-jiangnan/lotus-lake',
    });
  }
}
