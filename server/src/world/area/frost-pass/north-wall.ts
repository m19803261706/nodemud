/**
 * 朔云关·西段城墙 — 朔云关
 * 坐标: (-1, -3, 0)
 * 城墙西段巡逻道，可远望北漠草原，风大寒冽
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class FrostPassNorthWall extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '朔云关·西段城墙');
    this.set(
      'long',
      '城墙由巨石砌成，宽约两丈，足够两匹马并行。' +
        '墙面被风沙侵蚀得粗糙不平，垛口间架着弩床和成捆的箭矢。' +
        '从这里向北望去，草原一望无垠，枯草在寒风中伏倒又起，' +
        '偶尔能看到远处有黑点移动——或许是野狼，或许是北漠的骑哨。' +
        '巡逻的士兵每隔一刻经过一次，脚步声在石板上回响。' +
        '墙根下堆着檑木和滚石，都是守城时用来砸的，' +
        '旁边的油桶里装的是金汁，冻得半凝，散发着恶臭。' +
        '寒风从垛口灌进来，像刀子一样刮在脸上，' +
        '在这里站上一个时辰，整个人都会冻透。',
    );
    this.set('coordinates', { x: -1, y: -3, z: 0 });
    this.set('exits', {
      east: 'area/frost-pass/war-camp',
      south: 'area/frost-pass/training-ground',
      west: 'area/frost-pass/stable',
    });
  }
}
