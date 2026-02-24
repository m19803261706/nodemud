/**
 * 烟雨镇·渔村 — 镇西南的小渔村
 * 坐标: (0, 1, 0)
 * 渔网晾晒，鱼腥味浓，朴实的水上人家
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class JiangnanFishingVillage extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '烟雨镇·渔村');
    this.set(
      'long',
      '几间歪歪斜斜的木屋搭在水边，屋顶用茅草压了又压，仍然漏着雨。' +
        '渔网挂在竹竿上晾晒，破了的地方用细麻绳补了一层又一层。' +
        '空气里弥漫着浓重的鱼腥味，码头上堆着几只翻扣的木盆，' +
        '盆底长满了青苔。一条老黄狗趴在最大那间屋门口，' +
        '耷拉着耳朵，对来人只抬了抬眼皮便不再理会。' +
        '几个光着脚的孩子在浅水里摸鱼虾，笑声清脆地飘过水面。',
    );
    this.set('coordinates', { x: 0, y: 1, z: 0 });
    this.set('exits', {
      north: 'area/jiangnan/west-dock',
      east: 'area/jiangnan/stone-bridge',
      south: 'area/jiangnan/ancestral-hall',
    });
  }
}
