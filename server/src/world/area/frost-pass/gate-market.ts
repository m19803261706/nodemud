/**
 * 朔云关·关前集市 — 朔云关
 * 坐标: (1, 1, 0)
 * 南门外的简易集市，商旅在此交换边关紧缺物资
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class FrostPassGateMarket extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '朔云关·关前集市');
    this.set(
      'long',
      '南门外侧的一小片空地上，散落着十几个摊位。' +
        '摊位大多简陋，不过是地上铺一块布，上面摆着货物。' +
        '卖的东西五花八门：皮毛、药材、干粮、铁器零件，' +
        '偶尔也有走私来的北漠马奶酒和狼牙饰品。' +
        '讨价还价的声音此起彼伏，但音量都压得很低，' +
        '因为守门的士兵不时扫一眼这边，谁也不想被盘查。' +
        '集市虽小，却是方圆百里唯一能买到东西的地方。' +
        '角落里有几个裹着厚袍的人蹲在那里，' +
        '不买也不卖，只是看——这些人是什么来路，' +
        '在边关做过几年的人都心知肚明。',
    );
    this.set('coordinates', { x: 1, y: 1, z: 0 });
    this.set('exits', {
      north: 'area/frost-pass/supply-depot',
    });
  }
}
