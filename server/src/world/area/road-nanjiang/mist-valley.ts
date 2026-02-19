/**
 * 山路·迷雾谷 — 蛮疆山路第四段
 * 坐标: (0, 3, 0)
 * 常年云雾缭绕，林中猛兽出没
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadNanjiangMistValley extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '山路·迷雾谷');
    this.set(
      'long',
      '山谷中常年云雾缭绕，浓雾把周围的树木都化成了模糊的影子，' +
        '走几步就辨不清方向，只能靠脚下隐约的踩踏痕迹辨认小径。' +
        '雾里什么声音都显得遥远，脚步声也变得空洞。' +
        '远处隐约传来骨制风铃的声音，清脆却透着一股说不清的凉意，' +
        '像是有人在林子更深处挂了什么东西，随风而鸣，提醒外人：这里有人住。' +
        '草丛里偶尔传来重物踩踏的声音，是什么大型动物在雾中游走。',
    );
    this.set('coordinates', { x: 0, y: 3, z: 0 });
    this.set('exits', {
      north: 'area/road-nanjiang/vine-bridge',
      south: 'area/road-nanjiang/south-end',
    });
  }
}
