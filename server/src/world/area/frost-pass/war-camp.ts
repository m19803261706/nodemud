/**
 * 朔云关·军帐 — 朔云关
 * 坐标: (0, -3, 0)
 * 驻军营帐区，帐篷密布，是普通士兵驻扎之地
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class FrostPassWarCamp extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '朔云关·军帐');
    this.set(
      'long',
      '十余顶军帐整齐排列在关城北段的空地上，帐布被北风吹得鼓荡作响。' +
        '帐篷之间的空地上搭着简易的火堆，铁锅架在上面，' +
        '里头煮着清汤寡水的糜粥，偶尔能见到几块咸肉沉在锅底。' +
        '士兵们三五成群地蹲在火堆旁，有的擦拭兵器，有的缝补棉甲，' +
        '更多的只是沉默地盯着火焰发呆。' +
        '营帐入口挂着号牌，分属不同的什伍，管理井然有序。' +
        '帐篷里传出此起彼伏的鼾声——北境的士兵学会了一个本事：' +
        '随时随地都能入睡，因为不知道下一次合眼会是什么时候。',
    );
    this.set('coordinates', { x: 0, y: -3, z: 0 });
    this.set('exits', {
      south: 'area/frost-pass/fortress-hall',
      west: 'area/frost-pass/north-wall',
      east: 'area/frost-pass/east-wall',
      north: 'area/frost-pass/north-gate',
    });
  }
}
