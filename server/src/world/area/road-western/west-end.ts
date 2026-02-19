/**
 * 丝路·驿站近郊 — 西域丝路西端
 * 坐标: (-4, 0, 0)
 * 通往黄沙驿的最后一段路
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadWesternWestEnd extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '丝路·驿站近郊');
    this.set(
      'long',
      '一路走来的荒凉在这里略有缓和，远处可以看见一片绿意——' +
        '那是黄沙驿所在的绿洲，在广阔的黄沙中如同一块翡翠。' +
        '可以看见帐篷和矮屋的轮廓，还有骆驼的剪影在其间移动。' +
        '丝路上来往的商队就是靠这处驿站补给水和食物，' +
        '否则往西便是一望无际的荒漠，没有任何可以依靠的地方。' +
        '驿门就在前方，可以闻到炊烟和骆驼的气息。',
    );
    this.set('coordinates', { x: -4, y: 0, z: 0 });
    this.set('exits', {
      east: 'area/road-western/oasis-ruin',
      west: 'area/western-wastes/east-gate',
    });
  }
}
