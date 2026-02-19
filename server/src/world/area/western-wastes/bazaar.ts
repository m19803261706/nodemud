/**
 * 黄沙驿·集市 — 黄沙驿核心区域
 * 坐标: (-1, 0, 0)
 * 帐篷集市，各色商品，驿长萨木哈和遗迹商白狐在此活动
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class WesternWastesBazaar extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '黄沙驿·集市');
    this.set(
      'long',
      '帐篷搭成的集市蜿蜒在绿洲里，各色商品琳琅满目：' +
        '有中原来的丝绸和茶叶，有西域特产的香料和宝石，' +
        '有来路不明的古物和玉器，还有各种叫不出名字的干货和药材。' +
        '往来的商人操着各种口音，有的穿着长袍缠着头巾，有的是中原打扮，' +
        '还有几个看衣着像是极西之地来的异域人。' +
        '集市的核心是一顶最大的帐篷，那是驿站的大本营，' +
        '驿长就在里面坐镇，什么生意都管，什么消息都知道。',
    );
    this.set('coordinates', { x: -1, y: 0, z: 0 });
    this.set('exits', {
      east: 'area/western-wastes/east-gate',
      south: 'area/western-wastes/meditation-tent',
    });
  }
}
