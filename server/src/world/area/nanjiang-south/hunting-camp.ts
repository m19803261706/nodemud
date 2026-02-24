/**
 * 雾岚寨·狩猎营 — 猎人集合处
 * 坐标: (1, 0, 0)
 * 猎人们修整武器、分配猎物的地方
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class NanjiangSouthHuntingCamp extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '雾岚寨·狩猎营');
    this.set(
      'long',
      '几根木桩围出一片空地，地面踩得硬实，是猎人们集合出发的地方。' +
        '木架上挂着风干的兽皮和晾晒的弓弦，角落里堆放着竹制弩箭和捕兽夹。' +
        '一张粗木桌上摊着几块兽皮，用石头压着，边缘被裁割得整齐，' +
        '是猎人们回来后分配猎物时用的。' +
        '空气中弥漫着兽皮和松脂混合的气味，不太好闻，但猎人们毫不在意。' +
        '几把短弓斜靠在木桩上，弓身上缠着彩色丝线，是苗人独有的标记——' +
        '每个猎人的丝线颜色不同，一眼便知弓属于谁。',
    );
    this.set('coordinates', { x: 1, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/nanjiang-south/zhai-gate',
    });
  }
}
