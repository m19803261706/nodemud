/**
 * 潮汐港·鲸吞酒馆 — 海盗聚集的酒馆
 * 坐标: (0, 2, 0)
 * 最热闹也最危险的去处，烈酒与刀光并存
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class EasternSeaTavern extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '潮汐港·鲸吞酒馆');
    this.set(
      'long',
      '酒馆的招牌是一块鲸骨雕成的板子，上面用烧红的铁钎刻着"鲸吞"二字。' +
        '推门进去，一股混合了烈酒、汗臭和烟草的气味扑面而来。' +
        '大堂里摆满了粗笨的木桌和长凳，到处是酒渍和刀痕，' +
        '有几张桌面甚至被劈成了两半，又用铁钉草草钉在一起。' +
        '吧台后面的酒架上摆着各式各样的酒坛和酒瓶，' +
        '有些上面贴着东海岛屿的标记，有些根本没有标记——' +
        '那些通常是最烈的，也是最贵的。' +
        '角落里传来骰子碰撞的声响和赌徒的叫喊声。',
    );
    this.set('coordinates', { x: 0, y: 2, z: 0 });
    this.set('exits', {
      north: 'area/eastern-sea/harbor-square',
      east: 'area/eastern-sea/blade-street',
      south: 'area/eastern-sea/black-market',
    });
  }
}
