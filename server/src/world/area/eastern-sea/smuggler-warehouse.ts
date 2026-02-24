/**
 * 潮汐港·走私仓库 — 隐藏货物的秘密仓库
 * 坐标: (0, 4, 0)
 * 堆满了来路不明的货物，散发着潮湿霉味
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class EasternSeaSmugglerWarehouse extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '潮汐港·走私仓库');
    this.set(
      'long',
      '一座半埋在地下的石砌仓库，铁门上挂着三把大锁，' +
        '但其中两把早就锈烂了，形同虚设。' +
        '仓库内部比外面看上去大得多，' +
        '一排排木架上堆满了打着各种暗号标记的箱子和麻包。' +
        '有些箱子散发着浓烈的药草气味，有些沉得像装了铁块，' +
        '还有些被严严实实地封了蜡，谁也不知道里面是什么。' +
        '地面上有一条被磨得光亮的拖痕，' +
        '一直延伸到仓库最深处的一面石墙前——' +
        '那面石墙看上去和其他墙壁没什么不同，' +
        '但仔细看，墙角有一道不自然的缝隙。',
    );
    this.set('coordinates', { x: 0, y: 4, z: 0 });
    this.set('exits', {
      north: 'area/eastern-sea/black-market',
      down: 'area/eastern-sea/smuggler-tunnel',
    });
  }
}
