/**
 * 水路·水边酒家 — 水路·江南段
 * 坐标: (3,0,0)
 * 临水而建的小酒馆，过客歇脚之处
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadJiangnanWatersideInn extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '水路·水边酒家');
    this.set(
      'long',
      '一间临水搭建的小酒馆，木柱直接打在水边的泥地里，' +
        '二楼的回廊探出水面，坐在那里可以一边喝酒一边看船来船往。' +
        '酒幌子在微风中轻晃，上面写着"杏花村"三个褪色的墨字。' +
        '楼下支着几张方桌，桌面被磨得发亮，' +
        '一壶黄酒、一碟花生、一盘糟鱼，便是过客最常点的三样。' +
        '掌柜是个和气的胖子，总是笑眯眯地站在柜台后面擦杯子。',
    );
    this.set('coordinates', { x: 3, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/road-jiangnan/willow-gallery',
      east: 'area/road-jiangnan/misty-bridge',
    });
  }
}
