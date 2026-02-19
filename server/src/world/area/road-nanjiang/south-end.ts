/**
 * 山路·寨前石阶 — 蛮疆山路南端
 * 坐标: (0, 4, 0)
 * 通往雾岚寨的石阶，图腾柱初现
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadNanjiangSouthEnd extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '山路·寨前石阶');
    this.set(
      'long',
      '小径在此化为石阶，盘旋着向山顶延伸，每一级都被无数双脚磨得光滑。' +
        '石阶两旁开始出现图腾柱——粗壮的原木上雕刻着蛇、鸟和人形，' +
        '漆成红黑两色，颜色鲜艳，不像中原的审美，更像是某种宣示领地的语言。' +
        '有几根图腾柱上挂着骨饰，山风吹过时轻轻碰撞，发出细碎的声响。' +
        '顺着石阶往上望，山顶隐约可见木寨的轮廓，炊烟从林梢升起，' +
        '空气里开始混入草药和肉烟的气息。',
    );
    this.set('coordinates', { x: 0, y: 4, z: 0 });
    this.set('exits', {
      north: 'area/road-nanjiang/mist-valley',
      south: 'area/nanjiang-south/zhai-gate',
    });
  }
}
