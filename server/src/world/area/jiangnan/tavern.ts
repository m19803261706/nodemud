/**
 * 烟雨镇·望江酒楼 — 镇上最大的酒楼
 * 坐标: (1, 4, 0)
 * 三层木楼，热闹非凡，江湖人汇聚之所
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class JiangnanTavern extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '烟雨镇·望江酒楼');
    this.set(
      'long',
      '望江酒楼是烟雨镇最气派的建筑，三层飞檐翘角的木楼临河而立，' +
        '门口两只石狮子嘴角含笑，倒比别处的狮子多了几分市井气。' +
        '一楼大堂里摆着十几张八仙桌，酒客划拳行令的声音直冲屋顶。' +
        '跑堂的小二肩搭白毛巾，端着托盘在桌间穿梭如鱼。' +
        '柜台上方挂着一块匾——"醉里挑灯"，字写得歪歪扭扭，' +
        '据说是某年一位喝醉了的江湖大侠即兴题的。' +
        '酒香、菜香、汗味、烟味搅在一起，' +
        '这里有镇上最好的桂花酿和最新的江湖消息。',
    );
    this.set('coordinates', { x: 1, y: 4, z: 0 });
    this.set('exits', {
      north: 'area/jiangnan/herb-shop',
      south: 'area/jiangnan/dock-alley',
    });
  }
}
