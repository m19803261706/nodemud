/**
 * 黄沙驿·棕榈林 — 绿洲中的天然遮荫地
 * 坐标: (0, 2, 0)
 * 驿站东南角的棕榈林，旅人在此乘凉歇息
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class WesternWastesPalmGrove extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '黄沙驿·棕榈林');
    this.set(
      'long',
      '十几棵高大的棕榈树聚在一起，宽大的叶片在头顶交叠，' +
        '投下一大片难得的阴凉。地上铺着从树上落下的干叶子，' +
        '踩上去沙沙作响。' +
        '几个旅人背靠树干坐着，有的在打盹，有的在修补行囊，' +
        '有的在用干树枝拨弄面前的小火堆热茶。' +
        '从棕榈林往东南看去，能看到绿洲边缘的湖泊，' +
        '水面在阳光下闪着碎银般的光。' +
        '这里是整个驿站最宁静的角落，热闹的集市声传到这里已经很远了。',
    );
    this.set('coordinates', { x: 0, y: 2, z: 0 });
    this.set('exits', {
      north: 'area/western-wastes/sutra-hall',
      west: 'area/western-wastes/star-ruins',
      south: 'area/western-wastes/oasis-lake',
    });
  }
}
