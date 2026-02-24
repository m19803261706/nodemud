/**
 * 烟雨镇·青莲书院 — 江南名士求学之所
 * 坐标: (1, -2, 0)
 * 书卷气浓厚，文人雅集之地
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class JiangnanAcademy extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '烟雨镇·青莲书院');
    this.set(
      'long',
      '书院的大门朝南而开，门楣上悬着一块乌木匾额，"青莲书院"四字以馆阁体写就，' +
        '笔力沉稳，一看便知出自名家之手。院内几株老桂树撑开绿伞，' +
        '树下摆着石桌石凳，桌面上留着未干的墨迹。' +
        '正堂里传来朗朗书声，先生拿着戒尺的影子映在纸窗上。' +
        '院角有一口古井，井沿被绳索磨出深深的沟痕，' +
        '据说用此井水研墨，写出的字能多几分灵气。',
    );
    this.set('coordinates', { x: 1, y: -2, z: 0 });
    this.set('exits', {
      west: 'area/jiangnan/poem-gallery',
      east: 'area/jiangnan/music-hall',
      south: 'area/jiangnan/teahouse',
    });
  }
}
