/**
 * 洛阳废都·东城墙残段 — 城墙东段断裂处，死胡同
 * 坐标: (2, 0, 0)
 * 城墙彻底断裂，城外荒草，残墙满是涂鸦，野犬出没
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class EastWall extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '洛阳废都·东城墙残段');
    this.set(
      'long',
      '城墙在这里彻底断裂，断面粗粝参差，像是被某种巨力咬断，露出内里的夯土与碎石芯。' +
        '城外是大片荒草地，草茎又高又密，野风一过便翻起层层绿浪，偶有野犬钻入草丛，又消失不见。' +
        '残墙的内侧用炭笔和砖灰写满了涂鸦——「天命无常」「某某到此一游」「等我回来」，字迹深深浅浅，不知出自多少双不同的手。' +
        '这里是死路，更南边的城墙已经彻底坍入土中，连废墟都不剩了。',
    );
    this.set('coordinates', { x: 2, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/central-plain/patrol-road',
    });
  }
}
