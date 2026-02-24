/**
 * 朔云关·马厩 — 朔云关
 * 坐标: (-2, -3, 0)
 * 关城战马饲养之地，马嘶声不绝
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class FrostPassStable extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '朔云关·马厩');
    this.set(
      'long',
      '一排木棚沿西墙根搭建，棚内隔成十几个马栏，' +
        '里面拴着关城仅剩的十来匹战马。' +
        '马匹大多瘦削，肋骨隐约可见，' +
        '精料不够，只能喂干草充饥，但眼神仍然警觉而不驯。' +
        '地面铺着厚厚的稻草，被马蹄踩得湿透，散发着温热的气味。' +
        '棚顶漏风，冬天不得不用破旧的毡子遮挡，' +
        '即便如此，每到深夜仍有马匹冻得打颤。' +
        '墙上挂着几副马鞍和嚼头，皮面开裂，铜扣发绿，' +
        '但每一副都擦拭得干净——对于骑兵来说，' +
        '马具就是第二条命。',
    );
    this.set('coordinates', { x: -2, y: -3, z: 0 });
    this.set('exits', {
      east: 'area/frost-pass/north-wall',
      south: 'area/frost-pass/west-tower',
    });
  }
}
