/**
 * 烟雨镇·画桥 — 连接南北两岸的标志性石桥
 * 坐标: (1, 1, 0)
 * 地标建筑，桥上可观运河全景
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class JiangnanStoneBridge extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '烟雨镇·画桥');
    this.set(
      'long',
      '这座三孔石拱桥是烟雨镇最古老的建筑，桥身由整块青石砌成，' +
        '栏杆上雕着鲤鱼化龙的纹样，被无数双手摸得光滑如玉。' +
        '站在桥顶望去，运河水面如一匹铺展的绸缎，' +
        '两岸粉墙黛瓦倒映水中，分不清哪个是真，哪个是幻。' +
        '桥头立着一块风化的石碑，依稀刻着"永安桥"三字，是镇子的旧名。' +
        '逢年过节，桥上挂满红灯笼，倒影连成一条火龙，' +
        '是烟雨镇最让人难忘的景致。',
    );
    this.set('coordinates', { x: 1, y: 1, z: 0 });
    this.set('exits', {
      north: 'area/jiangnan/main-canal',
      west: 'area/jiangnan/fishing-village',
      east: 'area/jiangnan/boatyard',
      south: 'area/jiangnan/south-street',
      up: 'area/jiangnan/bridge-pavilion',
    });
  }
}
