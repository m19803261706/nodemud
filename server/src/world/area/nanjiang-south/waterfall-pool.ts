/**
 * 雾岚寨·瀑布潭 — 隐秘的山间瀑布
 * 坐标: (2, 4, 0)
 * 深山瀑布形成的水潭，水清见底，灵气充沛
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class NanjiangSouthWaterfallPool extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '雾岚寨·瀑布潭');
    this.set(
      'long',
      '一道瀑布从十几丈高的崖壁上倾泻而下，水声轰鸣，' +
        '溅起的水雾弥漫开来，在阳光下折射出若有若无的彩虹。' +
        '瀑布下方是一汪碧绿的深潭，水面平静如镜，' +
        '只在瀑布落点处翻滚着白色的泡沫。' +
        '潭边长满了翠绿的蕨类和苔藓，石头被水冲刷得圆润光滑。' +
        '水潭一侧有几块平整的大石，表面被水雾打湿，' +
        '隐约可以看到石面上有人坐过的痕迹——据说巫医偶尔会来此处静坐。' +
        '潭水清澈见底，可以看到水底的鹅卵石和偶尔游过的小鱼，' +
        '一切都安静得仿佛与世隔绝。',
    );
    this.set('coordinates', { x: 2, y: 4, z: 0 });
    this.set('exits', {
      west: 'area/nanjiang-south/deep-forest',
    });
  }
}
