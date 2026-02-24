/**
 * 烟雨镇·诗碑廊 — 历代文人墨客留下的诗碑走廊
 * 坐标: (0, -2, 0)
 * 文化沉淀之地，石碑上的字迹有些已模糊不清
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class JiangnanPoemGallery extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '烟雨镇·诗碑廊');
    this.set(
      'long',
      '一条幽静的回廊沿着水岸蜿蜒，两侧竖着大大小小的石碑，' +
        '碑面上刻满了历代文人过境时留下的诗词。有些字迹苍劲有力，历百年而不减锋芒；' +
        '有些已被苔藓侵蚀，只余残章断句，任后人揣摩。' +
        '回廊顶上爬满了紫藤，花期时紫瀑倾泻，落英缤纷。' +
        '廊尽头立着一块最大的碑，上书"烟雨千秋"四字，落款已不可辨。' +
        '偶有老者驻足碑前，低声诵读，神情恍若回到了那个笔墨纵横的年代。',
    );
    this.set('coordinates', { x: 0, y: -2, z: 0 });
    this.set('exits', {
      east: 'area/jiangnan/academy',
      south: 'area/jiangnan/waterside-house',
    });
  }
}
