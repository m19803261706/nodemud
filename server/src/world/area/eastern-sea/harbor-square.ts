/**
 * 潮汐港·鱼市广场 — 潮汐港
 * 坐标: (0,1,0)
 * 鱼市广场，海盗渔民混杂，港主霍三刀在此收保护费
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class EasternSeaHarborSquare extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '潮汐港·鱼市广场');
    this.set(
      'long',
      '腥味扑鼻的鱼市广场是潮汐港的核心地带，' +
        '鱼贩们大声叫卖，将各色海货摆在竹篓和木盆里。' +
        '海盗和普通渔民在此混杂，难以从外表区分，' +
        '只有那些腰间别着短刃、眼神警戒的才是真正的危险人物。' +
        '广场中央有一口废弃的石井，井口摆着几摞空的箱子，' +
        '是港主霍三刀手下日常收"保护费"的地方。' +
        '每当有船队靠港，总有几个人从角落里走出来，' +
        '不动声色地取走一袋银两，对方也心知肚明，没人敢多说一句话。',
    );
    this.set('coordinates', { x: 0, y: 1, z: 0 });
    this.set('exits', {
      north: 'area/eastern-sea/harbor-gate',
      east: 'area/eastern-sea/wharf',
      west: 'area/eastern-sea/harbor-inn',
    });
  }
}
