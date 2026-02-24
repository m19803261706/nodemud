/**
 * 朔云关·地牢 — 朔云关
 * 坐标: (0, -2, -1)
 * 守将府地下的牢房，关押战俘和罪犯
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class FrostPassDungeon extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '朔云关·地牢');
    this.set(
      'long',
      '沿着守将府后堂的一道暗梯向下走十几级台阶，便到了地牢。' +
        '这里终年不见天日，只靠墙上插着的几支油灯勉强照亮。' +
        '两侧各有四间牢房，以粗铁栅栏隔开，' +
        '栅栏上锈迹斑驳，但仍然结实。' +
        '大部分牢房是空的，只剩下发霉的稻草和铁链，' +
        '但最里面的两间似乎有人——' +
        '偶尔能听到铁链拖地的声响和低沉的呢喃。' +
        '空气潮湿阴冷，带着铁锈和腐烂的气味。' +
        '墙壁上有人用指甲刻下的字迹，大多已模糊不清，' +
        '依稀能辨认出几个字："放我出去"。',
    );
    this.set('coordinates', { x: 0, y: -2, z: -1 });
    this.set('exits', {
      up: 'area/frost-pass/fortress-hall',
      west: 'area/frost-pass/smuggler-tunnel',
    });
  }
}
