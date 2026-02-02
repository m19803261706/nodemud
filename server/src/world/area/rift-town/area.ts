/**
 * 裂隙镇 — 区域定义
 * 天裂后形成的裂谷中的中立小镇，各方势力的交汇之地
 */
import { Area } from '../../../engine/game-objects/area';

export default class RiftTownArea extends Area {
  static virtual = true;

  create() {
    this.set('name', '裂隙镇');
    this.set('description', '天裂后形成的裂谷中的中立小镇，各方势力的交汇之地');
    this.set('region', '中原·裂谷地带');
    this.set('level_range', { min: 1, max: 5 });
    this.set('rooms', [
      'area/rift-town/square',
      'area/rift-town/north-street',
      'area/rift-town/south-street',
      'area/rift-town/tavern',
      'area/rift-town/inn',
      'area/rift-town/herb-shop',
      'area/rift-town/smithy',
      'area/rift-town/notice-board',
      'area/rift-town/general-store',
      'area/rift-town/north-road',
      'area/rift-town/south-road',
      'area/rift-town/north-gate',
      'area/rift-town/south-gate',
      'area/rift-town/underground',
    ]);
  }
}
