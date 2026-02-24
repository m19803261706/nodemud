/**
 * 洛阳废都·废弃府衙 — 旧知府府邸
 * 坐标: (0, -1, 0)
 * 幕僚陈良在此坚守，公文堆积如山，却无人批复
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class GovernorMansion extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '洛阳废都·废弃府衙');
    this.set(
      'long',
      '曾经的洛阳知府府邸，朱漆大门已斑驳脱落，门上的铜钉锈成了深棕色。' +
        '正堂横梁上挂着「政通人和」的匾额，只是歪歪斜斜，像一个醉汉在硬撑着尊严。' +
        '幕僚陈良坐在堂中书案后，桌上叠满公文，大多已泛黄，字迹晕开，墨迹里封存着一个朝代的最后喘息。' +
        '院落一角翻倒着两把官椅，台阶上散落着当年仓皇撤离时遗落的文书，有人踩过，再无人拾起。',
    );
    this.set('coordinates', { x: 0, y: -1, z: 0 });
    this.set('exits', {
      west: 'area/central-plain/guard-barracks',
      east: 'area/central-plain/watchtower',
      north: 'area/central-plain/arena-ruins',
    });
  }
}
