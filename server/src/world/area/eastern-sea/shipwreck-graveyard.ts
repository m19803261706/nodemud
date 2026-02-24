/**
 * 潮汐港·沉船墓地 — 废弃船只的坟场
 * 坐标: (3, 1, 0)
 * 一片搁浅和沉没的旧船残骸，危机四伏
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class EasternSeaShipwreckGraveyard extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '潮汐港·沉船墓地');
    this.set(
      'long',
      '港湾东端是一片浅滩，十几条破败的旧船搁浅在此，' +
        '有的侧翻着露出长满藤壶的船底，有的只剩半截桅杆插在泥里。' +
        '退潮时，船骸之间的烂泥里露出锈蚀的铁锚、断裂的桨片和零散的骨头——' +
        '有些是鱼骨，有些看上去不太像。' +
        '涨潮时海水涌进来，腐朽的船板在水中发出吱嘎声响，' +
        '像是这些死去的船还在做最后的挣扎。' +
        '偶尔有胆大的拾荒者趁退潮来翻找值钱的东西，' +
        '但更多的时候，这里只有海鸥和螃蟹的领地。' +
        '据老海盗说，有些船沉下去时，船舱还没来得及清空。',
    );
    this.set('coordinates', { x: 3, y: 1, z: 0 });
    this.set('exits', {
      west: 'area/eastern-sea/fishing-dock',
    });
  }
}
