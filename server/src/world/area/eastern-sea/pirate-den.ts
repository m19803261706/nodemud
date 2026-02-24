/**
 * 潮汐港·海盗窝 — 海盗头目的据点
 * 坐标: (-2, 3, 0)
 * 散盟海盗的秘密聚会之所
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class EasternSeaPirateDen extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '潮汐港·海盗窝');
    this.set(
      'long',
      '瞭望塔后面的一处隐蔽凹地里，用沉船的残骸搭起了一座低矮的棚屋。' +
        '棚屋外面看着不起眼，里面却别有洞天：' +
        '墙上挂着几面黑色的海盗旗，旗上绣着各不相同的骷髅图案，' +
        '代表着不同的船队和头目。' +
        '屋中央是一张用舵轮改造的大圆桌，上面摊着好几张海图，' +
        '图上用匕首钉着几个位置，不知道标的是航线还是猎物。' +
        '角落堆着武器和绳索，空气中弥漫着朗姆酒和火药的气味。' +
        '这里是散盟在潮汐港的据点，' +
        '每逢月圆之夜，各路头目便在此聚首议事，' +
        '商量下一票该劫谁的船。',
    );
    this.set('coordinates', { x: -2, y: 3, z: 0 });
    this.set('exits', {
      north: 'area/eastern-sea/watchtower',
    });
  }
}
