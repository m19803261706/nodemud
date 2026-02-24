/**
 * 烟雨镇·顺风镖局 — 镇上的镖局据点
 * 坐标: (0, 3, 0)
 * 镖师练武，刀枪架上光芒冷冽
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class JiangnanEscortOffice extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '烟雨镇·顺风镖局');
    this.set(
      'long',
      '镖局的大门敞着，门楣上挂着一面三角镖旗，上书"顺风"二字，' +
        '被风吹得猎猎作响。院子里摆着刀枪架和练功桩，' +
        '几个镖师赤着上身在练对打，拳风带着呼呼的声响。' +
        '正厅门口停着一辆镖车，车上蒙着油布，不知装的什么货。' +
        '墙上挂着一张江南水路图，标注了各处关隘和匪患出没的地段。' +
        '角落里堆着几副崭新的甲片和绷带，看来最近跑镖不太平。' +
        '一个粗壮的汉子坐在门口擦刀，刀刃映出的光让人不敢直视。',
    );
    this.set('coordinates', { x: 0, y: 3, z: 0 });
    this.set('exits', {
      north: 'area/jiangnan/ancestral-hall',
      east: 'area/jiangnan/herb-shop',
    });
  }
}
