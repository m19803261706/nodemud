/**
 * 黄沙驿·钱庄 — 多国货币兑换处
 * 坐标: (-3, 2, 0)
 * 丝路上的金融枢纽，各国货币在此兑换
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class WesternWastesMoneyChanger extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '黄沙驿·钱庄');
    this.set(
      'long',
      '帐篷里搭着一张结实的木桌，桌面上摆着天平、砝码和几只铜盘。' +
        '铜盘里分别放着不同的货币：承天朝的铜钱、西域诸国的金币、' +
        '草原部落的银锭，还有一些刻着异国文字的小金属片。' +
        '钱庄掌柜坐在桌后，面前摆着一本厚厚的账册，' +
        '每笔兑换都用蝇头小楷记得清清楚楚。' +
        '他手指灵活地拨弄着钱币，每一枚都先用指甲弹一下，' +
        '听声辨真假，再用天平精确称重——丝路上的假币太多，不得不小心。',
    );
    this.set('coordinates', { x: -3, y: 2, z: 0 });
    this.set('exits', {
      north: 'area/western-wastes/weapon-stall',
    });
  }
}
