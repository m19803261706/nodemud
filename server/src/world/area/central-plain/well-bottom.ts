/**
 * 洛阳废都·古井底 — 广场古井深处的秘密空间
 * 坐标: (0, 1, -1)
 * 人工开凿的宽阔空间，硕鼠出没，废弃工程痕迹
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class CentralPlainWellBottom extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '洛阳废都·古井底');
    this.set(
      'long',
      '沿着广场古井垂下的绳索降至底部，眼前的空间出乎意料地宽阔——' +
        '这里远不止是一口普通水井，往下挖的人显然另有目的。' +
        '井壁四周布满人工开凿的痕迹，凿印整齐，像是出自有计划的施工，' +
        '而非随意挖掘。角落里堆着碎石和工具：几把凿子、一截废弃的撬棍，' +
        '以及一个倒扣的木桶，一切迹象表明这里曾有人长期作业，' +
        '然后在某个时刻戛然而止，再未回来。' +
        '暗处传来窸窸窣窣的声音——废都硕鼠的眼睛像一对橘色小灯笼，' +
        '在黑暗深处忽隐忽现。',
    );
    this.set('coordinates', { x: 0, y: 1, z: -1 });
    this.set('exits', {
      up: 'area/central-plain/ruins-square',
    });
  }
}
