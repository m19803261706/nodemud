/**
 * 潮汐港·醉汉巷 — 危险的狭窄小巷
 * 坐标: (-2, 1, 0)
 * 酒鬼与扒手出没的阴暗角落
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class EasternSeaDrunkAlley extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '潮汐港·醉汉巷');
    this.set(
      'long',
      '窄到只能一人通过的巷子里弥漫着酸臭的酒气和腐烂的鱼腥味。' +
        '地面湿滑，不知道是海水还是别的什么液体，' +
        '墙角蜷缩着几个烂醉如泥的酒鬼，嘴里含糊不清地嘟囔着什么。' +
        '巷子两侧的墙壁渗着水，长满了黑色的霉斑，' +
        '几根断裂的晾衣绳在头顶交错，上面挂着些破烂的衣物。' +
        '这里是潮汐港最危险的角落之一——' +
        '那些看似昏睡的醉汉中，有些未必真的醉了，' +
        '他们只是在等一个不长眼的过路人。',
    );
    this.set('coordinates', { x: -2, y: 1, z: 0 });
    this.set('exits', {
      east: 'area/eastern-sea/harbor-inn',
      south: 'area/eastern-sea/watchtower',
    });
  }
}
