/**
 * 官道·破败烽火台 — 官道北境段
 * 坐标: (0, -7, 0)
 * 一座年久失修的烽火台，是当年边防线的一部分
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class RoadNorthRuinedBeacon extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '官道·破败烽火台');
    this.set(
      'long',
      '一座三丈高的土墩矗立在路旁，顶部残存着半圈石垛和一个坍塌的火盆架。' +
        '这是前朝边防烽火台的遗迹，当年点燃狼烟，可以将军情在一日之内传回中原。' +
        '如今台基被风雨侵蚀得千疮百孔，一侧已经塌了大半，' +
        '露出的夯土层里嵌着碎石和草根，看上去摇摇欲坠。' +
        '台脚有一处被掏空的洞穴，不知是野兽的窝还是流浪者挖的避风处。' +
        '站在烽火台残顶向北望去，朔云关的轮廓已隐约可辨。',
    );
    this.set('coordinates', { x: 0, y: -7, z: 0 });
    this.set('exits', {
      south: 'area/road-north/grassland',
      north: 'area/road-north/north-end',
    });
  }
}
