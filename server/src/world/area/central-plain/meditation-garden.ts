/**
 * 洛阳废都·禅修废园 — 寺院后园，竹林卜卦之地
 * 坐标: (1, 3, 0)
 * 沉浸锚点：枯池底部刻有天裂之前的古星图
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class CentralPlainMeditationGarden extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '洛阳废都·禅修废园');
    this.set(
      'long',
      '寺院后面的小园，假山已经坍塌成几块乱石，枯水渠里长满了蒿草。' +
        '竹子疯长成林，遮天蔽日，将园中光线切割成细碎的斑片，' +
        '风一吹，竹叶沙沙，像是有人在低声交谈。' +
        '竹林深处，一个戴斗笠的男子在一张破桌旁盘腿而坐，' +
        '桌上摆着龟壳和三枚铜钱，那是他的全部家当。' +
        '园中央有一口枯池，池底铺满厚厚的落叶；' +
        '若将落叶拨开，可见池底凿刻着一幅星图，' +
        '布局精密，线条古拙，却与夜空中的星座对不上——不知出自何时何人之手。',
    );
    this.set('coordinates', { x: 1, y: 3, z: 0 });
    this.set('exits', {
      north: 'area/central-plain/temple-ruins',
      west: 'area/central-plain/south-gate',
    });
  }
}
