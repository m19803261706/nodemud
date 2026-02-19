/**
 * 雾岚寨·祖灵树 — 苗疆圣地
 * 坐标: (0, 2, 0)
 * 沉浸锚点：数百年古树，逝去族人的名牌，巫医玲珑驻地，树下不能动武
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class NanjiangSouthSpiritTree extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '雾岚寨·祖灵树');
    this.set(
      'long',
      '古树的树干要五六人合抱，树皮皱褶如老人面孔，不知道活了多少个年头。' +
        '粗壮的枝干向四面伸展，每一根枝上都挂满了布条和骨牌——' +
        '每一块骨牌上都刻着名字，是逝去族人的名字，一代代积累，密密麻麻，不知几百上千块。' +
        '山风一起，布条猎猎，骨牌轻碰，发出细碎绵长的声响，' +
        '像是那些名字在低语。外来者被允许在此静坐，但动武是对祖灵的冒犯。' +
        '树下有人打坐，是这寨子里的巫医。风中隐约有低语，听不清说的是什么。',
    );
    this.set('coordinates', { x: 0, y: 2, z: 0 });
    this.set('exits', {
      north: 'area/nanjiang-south/zhai-square',
      south: 'area/nanjiang-south/south-boundary',
    });
  }
}
