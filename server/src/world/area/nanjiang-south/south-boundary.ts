/**
 * 南疆·蛮荒边界 — 南疆封路占位
 * 坐标: (0, 3, 0)
 * 此路暂不通行，往南是百蛊滩，需要12级以上才可进入
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class NanjiangSouthSouthBoundary extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '南疆·蛮荒边界');
    this.set(
      'long',
      '古树后的小路在此渐渐消失，被蔓藤和荆棘封死。' +
        '空气变得更加潮湿，地面上有细小的虫子在腐叶间爬行。' +
        '一位老者蹲在路边，也不说话，只是看着你，等你开口。' +
        '他终于开口，声音沙哑而平静：' +
        '「再往南便是百蛊滩，密林中瘴气弥漫，部落间战事不断。' +
        '没有十二级以上的身手和当地人引路，进去就是送死。」' +
        '他顿了顿，继续道：「等你真的够强了，再来。」' +
        '荆棘深处，偶尔传来兽叫，低沉而遥远。',
    );
    this.set('coordinates', { x: 0, y: 3, z: 0 });
    this.set('exits', {
      north: 'area/nanjiang-south/spirit-tree',
    });
  }
}
