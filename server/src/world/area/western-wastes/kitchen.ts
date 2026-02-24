/**
 * 黄沙驿·厨房 — 驿馆后厨
 * 坐标: (-2, -1, 0)
 * 烟火气十足的驿馆后厨，供应丝路各族饭食
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class WesternWastesKitchen extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '黄沙驿·厨房');
    this.set(
      'long',
      '驿馆后面搭出来的露天厨房，一口大铁锅架在石头砌成的灶上，' +
        '底下的木柴烧得噼啪作响，锅里不知道炖着什么，冒出浓浓的白汽。' +
        '旁边的石板上摆着刚揉好的面团、切好的羊肉和一堆说不出名字的香料。' +
        '几只猫蹲在灶台边上，虎视眈眈地盯着案板上的肉，' +
        '偶尔被厨子挥着勺子赶走，但过一会儿又悄悄凑回来。' +
        '风把炊烟吹向绿洲的上空，在干燥的空气中格外显眼。',
    );
    this.set('coordinates', { x: -2, y: -1, z: 0 });
    this.set('exits', {
      east: 'area/western-wastes/caravansary',
    });
  }
}
