/**
 * 雾岚寨·蛊室 — 蛊术研究之所
 * 坐标: (1, 2, 0)
 * 巫医的蛊术研究室，气味诡异，外人不敢久留
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class NanjiangSouthGuRoom extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '雾岚寨·蛊室');
    this.set(
      'long',
      '竹墙围起的小屋里弥漫着一股说不出的气味——像是腐叶、血腥和花蜜的混合，' +
        '让人头皮发麻却又说不上哪里不对。' +
        '靠墙的架子上整齐地排列着几十个陶罐，大小不一，' +
        '每个罐口都用不同颜色的布封住，上面用苗文标注着什么。' +
        '有些罐子偶尔会发出细微的沙沙声，是里面的东西在动。' +
        '桌上放着几只透明的琉璃瓶，瓶中浸泡着颜色各异的虫子，' +
        '有的已经不动了，有的还在缓慢地蠕动，触角一缩一伸。' +
        '墙角挂着一串串风干的虫壳，在微风中轻轻碰撞，发出脆响。',
    );
    this.set('coordinates', { x: 1, y: 2, z: 0 });
    this.set('exits', {
      west: 'area/nanjiang-south/spirit-tree',
      south: 'area/nanjiang-south/forest-path',
    });
  }
}
