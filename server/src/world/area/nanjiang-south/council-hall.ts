/**
 * 雾岚寨·议事堂 — 长老议事之所
 * 坐标: (-1, 1, 0)
 * 部落重大决策的场所，图腾柱林立
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class NanjiangSouthCouncilHall extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '雾岚寨·议事堂');
    this.set(
      'long',
      '议事堂比寨中其他建筑都大，四根碗口粗的木柱撑起高高的屋顶，' +
        '柱身上刻满了蛇纹和鸟纹，涂着红黑两色的漆，年深日久已经斑驳。' +
        '堂中央立着一根三人高的图腾柱，柱顶雕着一只展翅的鹰，' +
        '柱身从上到下刻着历代寨主的名字，最下面的已经被磨得模糊不清。' +
        '地上铺着厚实的兽皮，围着图腾柱摆成半圆，是长老们议事时的座位。' +
        '墙上挂着几面牛皮盾和几柄苗刀，既是装饰，也是随时可以取用的武器。' +
        '堂内光线昏暗，只有几盏油灯在角落里闪烁，空气里有陈年松木的香气。',
    );
    this.set('coordinates', { x: -1, y: 1, z: 0 });
    this.set('exits', {
      north: 'area/nanjiang-south/bamboo-houses',
      east: 'area/nanjiang-south/zhai-square',
      south: 'area/nanjiang-south/altar',
      west: 'area/nanjiang-south/dyeing-workshop',
    });
  }
}
