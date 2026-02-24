/**
 * 雾岚寨·织染坊 — 蜡染工艺作坊
 * 坐标: (-2, 1, 0)
 * 苗族蜡染工艺的传承之地
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class NanjiangSouthDyeingWorkshop extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '雾岚寨·织染坊');
    this.set(
      'long',
      '织染坊搭在议事堂西侧，是一间半开放的竹棚，' +
        '三面有墙，正面敞开，方便采光和通风。' +
        '棚内架着几台木制织机，梭子来回穿行时发出有节奏的咔嗒声。' +
        '一根根染好的布匹挂在竹竿上晾晒，蓝靛、藏青、月白，' +
        '上面绘着精美的蜡染图案——飞鸟、游鱼、蝴蝶、连绵的山脉。' +
        '角落里几口大缸盛着不同颜色的染料，缸沿被染得五颜六色。' +
        '一位苗族妇人正弯腰在白布上用蜡刀描画，手法熟练，' +
        '蜡液顺着铜刀流淌在布面上，勾勒出一只振翅的凤凰。' +
        '空气中弥漫着蓝靛草和蜂蜡混合的气味，有一种安宁的质感。',
    );
    this.set('coordinates', { x: -2, y: 1, z: 0 });
    this.set('exits', {
      east: 'area/nanjiang-south/council-hall',
    });
  }
}
