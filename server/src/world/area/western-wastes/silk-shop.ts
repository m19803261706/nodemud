/**
 * 黄沙驿·丝绸铺 — 中原丝绸与西域织品
 * 坐标: (-3, 0, 0)
 * 丝路的核心商品：丝绸，在这里完成东西方的交汇
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class WesternWastesSilkShop extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '黄沙驿·丝绸铺');
    this.set(
      'long',
      '帐篷里挂满了各色丝绸，从中原来的素白绢、杭锦、蜀绣，' +
        '到西域本地的毛毯、驼绒和一种用金线织成的厚重布料。' +
        '丝绸在干燥的空气中轻轻飘动，阳光透过帐篷的缝隙照进来，' +
        '在丝面上流转出柔和的光泽。' +
        '铺主是个中原来的女商人，据说从长安一路押货到这里，' +
        '路上遇过沙匪、断过水，硬是咬牙走完了丝路最难的一段。' +
        '她用一把剪刀裁下一角丝绸递给买主看，动作利落而自信。',
    );
    this.set('coordinates', { x: -3, y: 0, z: 0 });
    this.set('exits', {
      east: 'area/western-wastes/spice-stall',
      south: 'area/western-wastes/weapon-stall',
    });
  }
}
