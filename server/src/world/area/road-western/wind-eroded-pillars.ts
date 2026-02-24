/**
 * 丝路·风蚀岩柱 — 西域丝路
 * 坐标: (-3, 0, 0)
 * 雅丹地貌，风蚀形成的奇诡岩柱如鬼城
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadWesternWindErodedPillars extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '丝路·风蚀岩柱');
    this.set(
      'long',
      '丝路在这里穿过一片雅丹地貌，两旁矗立着被千年风沙蚀刻出的岩柱，' +
        '形态诡异——有的像伸出的手指，有的像蹲踞的怪兽，' +
        '有的顶部被削去一半，摇摇欲坠却不知挺立了多少年。' +
        '风穿过岩柱之间的缝隙时会发出呜咽般的声响，' +
        '黄昏时听来尤为瘆人，当地人称此处为「鬼哭滩」。' +
        '岩柱表面布满了一层层风化剥落的纹理，像是被什么东西一刀刀削过，' +
        '有些纹路中渗出暗红色的矿物质，在阳光下隐隐泛着铁锈般的光泽。',
    );
    this.set('coordinates', { x: -3, y: 0, z: 0 });
    this.set('exits', {
      east: 'area/road-western/dusty-wasteland',
      west: 'area/road-western/sandstorm-pass',
    });
  }
}
