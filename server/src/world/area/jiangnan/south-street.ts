/**
 * 烟雨镇·南街 — 运河南岸的商业街
 * 坐标: (1, 2, 0)
 * 商铺密集，人来人往，南岸的热闹地带
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class JiangnanSouthStreet extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '烟雨镇·南街');
    this.set(
      'long',
      '过了画桥往南便是南街，比北岸的运河街更窄些，却也更热闹。' +
        '两旁的商铺挨得极近，对面的店主伸手几乎能递过东西来。' +
        '卖糕团的、卖糖人的、磨剪子戗菜刀的，各种吆喝声混在一起。' +
        '街面铺的是条石，被无数脚步磨得光亮如镜，' +
        '雨天走在上面得格外小心。' +
        '街角处有棵歪脖子柳树，树下摆着一张老旧的长条凳，' +
        '总有几个闲人坐在那里嗑瓜子聊闲天，打听镇上的新鲜事。',
    );
    this.set('coordinates', { x: 1, y: 2, z: 0 });
    this.set('exits', {
      north: 'area/jiangnan/stone-bridge',
      west: 'area/jiangnan/ancestral-hall',
      east: 'area/jiangnan/warehouse',
      south: 'area/jiangnan/herb-shop',
    });
  }
}
