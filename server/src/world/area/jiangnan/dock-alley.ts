/**
 * 烟雨镇·码头巷 — 酒楼后的狭窄巷道
 * 坐标: (1, 5, 0)
 * 阴暗潮湿，连接暗巷，可疑人物出没
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class JiangnanDockAlley extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '烟雨镇·码头巷');
    this.set(
      'long',
      '从酒楼后门拐出来便是一条窄巷，两侧墙壁高耸，' +
        '抬头只能看见一线天光。巷子地面湿漉漉的，' +
        '不知是运河渗上来的水还是昨夜的雨没干透。' +
        '墙角堆着破旧的酒坛和烂菜叶，几只老鼠大摇大摆地穿行其间。' +
        '巷子深处偶尔能看到几个鬼鬼祟祟的身影，' +
        '低声说着什么便快步消失在拐角。' +
        '墙上用炭笔画着几个奇怪的符号，像是某种暗号，' +
        '不知情的人看了只觉得是小孩涂鸦。',
    );
    this.set('coordinates', { x: 1, y: 5, z: 0 });
    this.set('exits', {
      north: 'area/jiangnan/tavern',
      east: 'area/jiangnan/dark-alley',
    });
  }
}
