/**
 * 潮汐港·走私密道 — 地下秘密通道
 * 坐标: (0, 4, -1)
 * 阴暗潮湿的地下通道，是走私客的专属路线
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class EasternSeaSmugglerTunnel extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '潮汐港·走私密道');
    this.set(
      'long',
      '从仓库石墙后的暗门钻进来，是一条仅能弯腰通过的地下通道。' +
        '头顶的岩壁不断渗水，脚下的地面泥泞不堪，' +
        '每走一步都能听到鞋底从烂泥中拔出的声响。' +
        '通道两侧的石壁上凿了一些壁龛，' +
        '里面塞着油布包裹的火把和引火石，供来往的人使用。' +
        '空气又闷又湿，夹杂着泥土和海水的咸腥味，' +
        '偶尔能听到头顶上方隐约传来的脚步声——' +
        '那是地面上的人不知道脚下还有一个世界。' +
        '通道在这里分出一个岔口，一条向东延伸进更深的黑暗中。',
    );
    this.set('coordinates', { x: 0, y: 4, z: -1 });
    this.set('exits', {
      up: 'area/eastern-sea/smuggler-warehouse',
      east: 'area/eastern-sea/treasure-cave',
    });
  }
}
