/**
 * 黄沙驿·香料摊 — 异域香料集散地
 * 坐标: (-2, 0, 0)
 * 丝路上最重要的香料交易点，气味浓烈，色彩斑斓
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class WesternWastesSpiceStall extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '黄沙驿·香料摊');
    this.set(
      'long',
      '几顶低矮的帐篷连在一起，地上铺着毯子，毯子上摆满了各色香料。' +
        '番红花的金黄、胡椒的黑亮、丁香的暗褐、肉桂的赭红——' +
        '颜色堆在一起，像是谁打翻了一盘颜料。' +
        '空气中混杂着数十种气味，浓烈得让人几乎睁不开眼。' +
        '商人用小铜秤仔细称量，一粒都不能多，一粒也不能少，' +
        '因为上好的番红花论克卖，比等重的银子还贵。' +
        '买家操着各种口音讨价还价，手指捻着香料粉末嗅闻辨别真伪。',
    );
    this.set('coordinates', { x: -2, y: 0, z: 0 });
    this.set('exits', {
      east: 'area/western-wastes/bazaar',
      west: 'area/western-wastes/silk-shop',
      south: 'area/western-wastes/curio-shop',
      north: 'area/western-wastes/kitchen',
    });
  }
}
