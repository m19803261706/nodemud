/**
 * 朔云关·城隍小庙 — 朔云关
 * 坐标: (-1, 1, 0)
 * 南门外侧的小庙，过往商旅和士兵祈求平安之地
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class FrostPassShrine extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '朔云关·城隍小庙');
    this.set(
      'long',
      '一座不起眼的小庙，就在南门旁边的墙角下，' +
        '庙门低矮，进去得弯腰，里面只有一间屋子。' +
        '正中供着一尊城隍像，面目模糊，被香火熏成了黑色，' +
        '但仍有人日日上香——香案上积着厚厚的香灰，蜡泪凝成了一坨。' +
        '墙壁上挂满了红布条，上面写着各种祈愿：' +
        '"平安归来"、"北漠退兵"、"家人无恙"。' +
        '有些布条已经褪色发白，写字的人不知还在不在。' +
        '庙角放着一个破旧的功德箱，里面只有几枚铜钱。' +
        '这座小庙不属于任何宗门，是边关将士们自发修建的，' +
        '在这里，信仰无关教义，只关乎活着。',
    );
    this.set('coordinates', { x: -1, y: 1, z: 0 });
    this.set('exits', {
      north: 'area/frost-pass/tavern',
    });
  }
}
