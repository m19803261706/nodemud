/**
 * 潮汐港·黑市 — 违禁品交易的暗巷
 * 坐标: (0, 3, 0)
 * 见不得光的买卖，在这里都是明码标价
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class EasternSeaBlackMarket extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '潮汐港·黑市');
    this.set(
      'long',
      '从酒馆后门拐进一条昏暗的窄巷，两侧的棚屋用油布和破帆遮盖，' +
        '透进来的光线被切割成一条条细缝，照在摊主们阴晴不定的脸上。' +
        '这里是潮汐港的黑市，贩卖的东西五花八门：' +
        '来路不明的兵器、偷来的珠宝首饰、' +
        '据说能解百毒的药丸、甚至还有朝廷的通缉令——' +
        '买家拿去可以提前知道谁在被追捕。' +
        '每个摊位前都站着一两个面色凶悍的打手，' +
        '不是保护摊主，是保护规矩：' +
        '看了不买可以，但看了就不许说出去。',
    );
    this.set('coordinates', { x: 0, y: 3, z: 0 });
    this.set('exits', {
      north: 'area/eastern-sea/tavern',
      south: 'area/eastern-sea/smuggler-warehouse',
    });
  }
}
