/**
 * 嵩阳宗·药圃
 * 弟子院以南，种植灵草药材之所
 * 坐标: (-1, -4, 0)
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class SongyangHerbGarden extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '嵩阳宗·药圃');
    this.set(
      'long',
      '几畦药田整齐排列，篱笆用竹枝编就。灵草在山风中轻摇，叶面沾着晨露，散发出清苦的草药气息。田间插着手写的药名竹牌，字迹稚拙，多是药童所书。',
    );
    this.set('coordinates', { x: -1, y: -4, z: 0 });
    this.set('exits', {
      north: 'area/songyang/disciples-yard',
    });

    // 可采集资源（药圃品种齐全，概率均匀）
    this.set('gatherables', [
      {
        id: 'herb-金线草',
        name: '金线草',
        messages: [
          '你蹲在药田旁，拔起一株{name}，根须沾着湿润的泥土。',
          '你顺着竹牌标记找到{name}，小心连根拔起。',
          '药田里的{name}长势正好，你摘下一株放入怀中。',
        ],
      },
      {
        id: 'herb-石斛',
        name: '石斛',
        messages: [
          '你在篱笆边发现几丛{name}，摘下一株。',
          '一株{name}攀附在竹架上，你轻轻将它取下。',
        ],
      },
      {
        id: 'herb-七星莲',
        name: '七星莲',
        messages: [
          '药田角落长着一小片{name}，你摘下一株。',
          '你认出药牌上写着{name}，蹲下采了一株。',
        ],
      },
      {
        id: 'herb-断肠藤',
        name: '断肠藤',
        messages: [
          '你戴上手套，小心地剪下一段{name}。',
          '一根{name}缠在篱笆上，你谨慎地取下一截。',
        ],
      },
    ]);
  }
}
