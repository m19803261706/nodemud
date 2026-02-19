/**
 * 黄沙驿·禅修帐 — 星轨殿占位
 * 坐标: (-1, 1, 0)
 * 沉浸锚点：密宗行者达摩旃打坐之地，夜晚可见星空
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class WesternWastesMeditationTent extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '黄沙驿·禅修帐');
    this.set(
      'long',
      '帐篷低矮，门帘厚重，走进去，热闹的集市声音骤然减弱。' +
        '地上铺着旧毡，上面有打坐时磨出的印痕，颜色比周围深一圈。' +
        '帐内没有多余的陈设，只有角落放着几本经卷，用布仔细包好。' +
        '帐顶有一道细长的缝隙，白天透入一线天光，到了夜晚，' +
        '可以从这里看见西域的星空——据说这里的星星比中原的更多、更亮，' +
        '因为离天更近，空气更干净。' +
        '帐中央盘坐着一位僧侣，身着暗红色法衣，闭目打坐，' +
        '嘴唇微动，似乎在默念什么。',
    );
    this.set('coordinates', { x: -1, y: 1, z: 0 });
    this.set('exits', {
      north: 'area/western-wastes/bazaar',
    });
  }
}
