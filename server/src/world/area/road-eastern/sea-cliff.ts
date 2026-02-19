/**
 * 海路·海蚀崖 — 海路·东海段
 * 坐标: (2,0,0)
 * 野怪房，海蚀崖洞，海盗斥候出没
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadEasternSeaCliff extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '海路·海蚀崖');
    this.set(
      'long',
      '一处巨大的海蚀崖洞，是海浪千百年来侵蚀岩石留下的痕迹。' +
        '洞口高约两丈，内部宽阔幽深，浪声在其中回响，轰隆如雷，令人心跳加速。' +
        '崖洞岩壁上密密麻麻附着各种贝类，' +
        '拳头大小的牡蛎和笠贝挤在一起，随着海浪时而露出时而被淹没。' +
        '洞口高处有人为搭建的简陋嘹望台，用几根粗木钉进崖壁而成，' +
        '上面摆着一架望远镜，已经生锈，显然是海盗用来监视海面的哨位。',
    );
    this.set('coordinates', { x: 2, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/road-eastern/coastal-road',
      east: 'area/road-eastern/reef-path',
    });
  }
}
