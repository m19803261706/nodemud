/**
 * 洛阳废都·西城墙残段 — 城墙西段断裂处，死胡同
 * 坐标: (-2, 0, 0)
 * 朝西的残墙，夕阳拉出长影，流浪者留下的篝火灰烬
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class WestWall extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '洛阳废都·西城墙残段');
    this.set(
      'long',
      '城墙在西侧同样断裂，这一面朝向落日，夕阳将残墙的轮廓拉成一道长达数丈的阴影，像这座城最后一声低沉的叹息。' +
        '夕照的光把残砖照得橙红，像是短暂的回光，远看竟有几分庄严，走近了才看见遍布的风化与破败。' +
        '城墙根下散落着几堆篝火灰烬，炭渣已冷透，旁边留着啃过的骨头和破烂的布片，是流浪者过夜的痕迹。' +
        '这里是死路，向西延伸的城墙早已夷为平地，断面之外是无边的旷野，静得像另一个世界。',
    );
    this.set('coordinates', { x: -2, y: 0, z: 0 });
    this.set('exits', {
      east: 'area/central-plain/collapsed-tower',
      south: 'area/central-plain/market-ruins',
    });
  }
}
