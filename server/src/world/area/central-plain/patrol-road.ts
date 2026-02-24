/**
 * 洛阳废都·城墙巡道 — 城墙顶部的巡逻通道
 * 坐标: (1, 0, 0)
 * 垛口多已坍塌，城砖松动，昔日巡卫换作长风
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class PatrolRoad extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '洛阳废都·城墙巡道');
    this.set(
      'long',
      '城墙顶部的巡逻通道，大部分垛口已经坍塌，残余的几个像是豁了牙的老人，站在那里无言地守望。' +
        '脚下的城砖缝隙里长满了杂草，根系深扎进砖缝，有些砖已经松动，踩上去微微下沉，令人心悸。' +
        '从这里向南望去是北城门，向北是残破的望楼尖顶，向东城墙逶迤延伸，像一道没能合拢的伤口。' +
        '曾经一班接一班的巡卫沿着这条路踏过无数遍，如今只有风在这里一遍一遍地重复那个早已结束的仪式。',
    );
    this.set('coordinates', { x: 1, y: 0, z: 0 });
    this.set('exits', {
      west: 'area/central-plain/north-gate',
      north: 'area/central-plain/watchtower',
      east: 'area/central-plain/east-wall',
    });
  }
}
