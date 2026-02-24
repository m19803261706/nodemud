/**
 * 朔云关·军需库 — 朔云关
 * 坐标: (1, 0, 0)
 * 关城物资储备之地，粮草兵械皆在此处调配
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class FrostPassSupplyDepot extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '朔云关·军需库');
    this.set(
      'long',
      '一座低矮而宽阔的石屋，门口挂着军需司的牌子，进出需要核验腰牌。' +
        '屋内沿墙堆满了木箱和麻袋，箱子上用墨笔标着"甲""弩""矢"等字样，' +
        '麻袋里装的是米粮和干肉，有些已经长了霉斑。' +
        '正中一张大案几上铺着账簿，密密麻麻记录着各项物资的出入数目。' +
        '账目写得工整，但数字触目惊心——' +
        '粮草只够支撑两个月，箭矢消耗的速度远超补给，' +
        '棉甲的库存已经见底，新到的补给遥遥无期。' +
        '屋角放着一杆秤和几个量斗，是军需官每日清点物资用的。' +
        '整个库房弥漫着粮食、皮革和霉味混合的气息。',
    );
    this.set('coordinates', { x: 1, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/frost-pass/south-gate',
      south: 'area/frost-pass/gate-market',
    });
  }
}
