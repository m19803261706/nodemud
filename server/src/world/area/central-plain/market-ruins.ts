/**
 * 洛阳废都·旧集市废墟 — 昔日最繁华集市，如今满目疮痍
 * 坐标: (-2, 1, 0)
 * 流民翻检废摊，零星杂货棚冷清营业
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class CentralPlainMarketRuins extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '洛阳废都·旧集市废墟');
    this.set(
      'long',
      '昔日洛阳最繁华的集市，如今只剩破损的摊位框架和褪色的幡旗，' +
        '布料早已腐烂，只剩几根竹竿斜插在地，像是乱葬岗的标记。' +
        '地面还能看到被踩得光滑的石板——那是千万双脚磨出来的，' +
        '岁月的印记比任何史书都诚实。' +
        '偶有几个流民在废摊位间低头翻找，不知在寻什么，眼神空洞而执着。' +
        '废墟一角有人搭了个简易棚子卖杂货，油布遮着几样说不清来历的物件，生意冷清得可怜。',
    );
    this.set('coordinates', { x: -2, y: 1, z: 0 });
    this.set('exits', {
      north: 'area/central-plain/west-wall',
      south: 'area/central-plain/refugee-camp',
    });
  }
}
