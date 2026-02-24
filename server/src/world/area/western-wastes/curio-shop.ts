/**
 * 黄沙驿·奇物铺 — 来路不明的神秘物品
 * 坐标: (-2, 1, 0)
 * 卖些真真假假的古物和灵物，买家需自辨真伪
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class WesternWastesCurioShop extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '黄沙驿·奇物铺');
    this.set(
      'long',
      '帐篷比别处暗一些，门帘厚重，走进去需要适应一下光线。' +
        '货架上摆着各种光怪陆离的物件：据说能辟邪的符石，' +
        '刻着不知名文字的铜牌，颜色诡异的药粉，' +
        '还有几枚用玻璃瓶装着的干枯虫子，标签写着「沙蝎王胆」。' +
        '真假难辨，全凭买家眼力。' +
        '铺主是个裹着面巾的人，性别都看不太清楚，' +
        '只露出一双深邃的眼睛，说话时声音压得很低，' +
        '像是怕隔壁帐篷的人听见。',
    );
    this.set('coordinates', { x: -2, y: 1, z: 0 });
    this.set('exits', {
      north: 'area/western-wastes/spice-stall',
      east: 'area/western-wastes/meditation-tent',
      west: 'area/western-wastes/weapon-stall',
      south: 'area/western-wastes/guard-post',
    });
  }
}
