/**
 * 潮汐港·远航码头 — 潮汐港
 * 坐标: (1,1,0)
 * 沉浸锚点，大型船只停泊处，仙岛使者凌虚在此
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class EasternSeaWharf extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '潮汐港·远航码头');
    this.set(
      'long',
      '大型船只停泊的远航码头延伸入深水区，岸边系着数条缆绳，' +
        '粗如手臂，将庞然大物一样的船牢牢锁在岸边。' +
        '码头尽头停着一艘半沉的旧船，甲板已腐朽下陷，' +
        '但船上有人最近生过火的痕迹，灰烬还未完全冷却。' +
        '夜晚，附近海面发出幽幽的蓝色荧光，' +
        '渔民说是冤魂作祟，老海盗说那里有宝藏，' +
        '没有人敢去证实，也没有人愿意忘记。' +
        '一位白衣男子站在码头边缘，望着海天交界处，' +
        '衣袂随风飘动，宛如画中人。',
    );
    this.set('coordinates', { x: 1, y: 1, z: 0 });
    this.set('exits', {
      west: 'area/eastern-sea/harbor-square',
    });
  }
}
