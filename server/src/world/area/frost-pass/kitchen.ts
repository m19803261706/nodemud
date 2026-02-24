/**
 * 朔云关·伙房 — 朔云关
 * 坐标: (-2, -1, 0)
 * 关城的伙房，负责全军伙食
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class FrostPassKitchen extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '朔云关·伙房');
    this.set(
      'long',
      '一间烟熏火燎的石屋，三口大灶一字排开，' +
        '灶膛里的柴火烧得噼啪作响，锅里翻滚着米粥和咸菜。' +
        '墙角堆着劈好的柴火和几缸腌菜，' +
        '梁上挂着几条风干的肉——那是上个月猎到的野鹿，省着吃能挨半月。' +
        '灶台上的铁锅油腻腻的，但伙夫擦得还算勤快。' +
        '屋里热气腾腾，与外面的严寒形成鲜明对比，' +
        '士兵们喜欢端着碗蹲在伙房门口吃饭，既暖和又方便添粥。' +
        '空气中弥漫着粗粮和咸肉的味道，算不上美味，' +
        '但在这苦寒之地，一碗热粥就是最大的慰藉。',
    );
    this.set('coordinates', { x: -2, y: -1, z: 0 });
    this.set('exits', {
      east: 'area/frost-pass/watchtower',
    });
  }
}
