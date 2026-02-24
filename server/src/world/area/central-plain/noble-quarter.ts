/**
 * 洛阳废都·旧贵人坊 — 曾经富户聚居之地，如今盗贼出没
 * 坐标: (2, 1, 0)
 * 废宅连绵，盗贼翻挖藏宝，残留昔日繁华遗迹
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class CentralPlainNobleQuarter extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '洛阳废都·旧贵人坊');
    this.set(
      'long',
      '曾经住着门派执事和城中富户的街区，庭院的围墙有些还完好，' +
        '朱漆大门或紧闭着，或被人踹开，铰链歪斜，露出荒芜的院落。' +
        '能看到院内曾经精致的假山和鱼池——假山歪了，压着半截石雕人像，' +
        '鱼池早已干涸，积水成了蛙塘，蛙声比往年的笑声更响亮。' +
        '偶尔有人影在废宅间闪过，动作鬼祟，专找墙缝和地砖下的夹层，' +
        '那些旧主人藏好的东西，终究没能瞒过乱世里饥饿的眼睛。',
    );
    this.set('coordinates', { x: 2, y: 1, z: 0 });
    this.set('exits', {
      west: 'area/central-plain/broken-hall',
      south: 'area/central-plain/old-library',
    });
  }
}
