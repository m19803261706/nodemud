/**
 * 潮汐港·斗兽场 — 地下角斗与斗兽的场所
 * 坐标: (-1, 4, 0)
 * 血腥的娱乐场，海盗们最爱的消遣
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class EasternSeaArena extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '潮汐港·斗兽场');
    this.set(
      'long',
      '一个用条石围成的圆形凹坑，直径约十丈，坑壁有一人多高。' +
        '坑底的沙地被反复翻过无数次，怎么也盖不住渗进去的血腥气。' +
        '坑沿上围了一圈粗木栏杆，看台上的长凳高低错落，' +
        '每到夜晚就坐满了叫喊助威的海盗和赌客。' +
        '角落里关着几只铁笼，笼中是从各处捕来的猛兽——' +
        '有南海的毒蛇，有深山的黑熊，甚至有一头瘦骨嶙峋的老虎。' +
        '笼子旁边竖着一块记分的木牌，' +
        '上面歪歪扭扭地记录着历次角斗的赔率和胜负。' +
        '在这里，命和银子一样，都是筹码。',
    );
    this.set('coordinates', { x: -1, y: 4, z: 0 });
    this.set('exits', {
      north: 'area/eastern-sea/freshwater-well',
    });
  }
}
