/**
 * 洛阳废都·万宗广场 — 各派盟誓旧地
 * 坐标: (0, 1, 0)
 * 沉浸锚点：中心古井倒映残碑文「天下武学，殊途同归」
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class CentralPlainRuinsSquare extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '洛阳废都·万宗广场');
    this.set(
      'long',
      '各大门派曾在此立碑盟誓的广场，如今碑石全部被推倒，' +
        '散乱躺在荒草丛中，有的已经碎成数块，有的仅剩底座。' +
        '广场中心有一口古井，井壁光滑，水面黑而幽深。' +
        '低头望去，水面倒映着一块碎碑的侧影，上有半行字迹——「天下武学，殊途同归」。' +
        '不知是哪派的宗旨，如今这句话只剩倒影。' +
        '东面是一座已断壁残殿，西面是一家灯火昏黄的酒肆。',
    );
    this.set('coordinates', { x: 0, y: 1, z: 0 });
    this.set('exits', {
      north: 'area/central-plain/north-gate',
      east: 'area/central-plain/broken-hall',
      west: 'area/central-plain/old-tavern',
    });
  }
}
