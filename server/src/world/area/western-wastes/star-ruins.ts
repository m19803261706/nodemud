/**
 * 黄沙驿·星轨殿遗址 — 太古遗迹
 * 坐标: (-1, 2, 0)
 * 半埋在沙中的神秘遗迹，据说与太古纪的星象观测有关
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class WesternWastesStarRuins extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '黄沙驿·星轨殿遗址');
    this.set(
      'long',
      '半截石柱从沙里探出来，像是大地伸出的手指，指向天空。' +
        '残垣断壁间散落着碎石和沙砾，偶尔能看到石面上刻着的纹路，' +
        '那些纹路像是星图，又像是某种不知名的文字，被风沙磨去了大半。' +
        '这里是星轨殿的遗址，据说太古纪时的先民在此观测星象，' +
        '记录天穹的运行规律，将天道刻在石头上，以求永恒。' +
        '如今殿堂已毁，只剩一片苍凉的废墟，' +
        '但每到夜晚，这里的星空确实格外明亮，' +
        '仿佛那些古老的石刻仍在与天上的星星遥遥相应。',
    );
    this.set('coordinates', { x: -1, y: 2, z: 0 });
    this.set('exits', {
      north: 'area/western-wastes/meditation-tent',
      west: 'area/western-wastes/guard-post',
      east: 'area/western-wastes/palm-grove',
      south: 'area/western-wastes/ascetic-cliff',
    });
  }
}
