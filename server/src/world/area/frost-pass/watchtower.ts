/**
 * 朔云关·烽燧台 — 朔云关
 * 坐标: (-1, -1, 0)
 * 沉浸锚点：登台俯瞰北方草原，台上刻满守关士兵姓名
 */
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class FrostPassWatchtower extends RoomBase {
  static virtual = true;

  create() {
    this.set('short', '朔云关·烽燧台');
    this.set(
      'long',
      '烽燧台高出城墙一丈有余，登上台顶，北方的草原便尽收眼底。' +
        '枯黄的草甸无边无际，一直延伸到天际那条细细的灰线，' +
        '那是更北处的山脉，据说山的那边就是狼庭的王帐所在。' +
        '台面的石砖上密密麻麻刻满了名字——每一个曾在此驻守的士兵都会刻下自己的名字，' +
        '有的字迹已被风沙磨浅，有的还清晰可辨。' +
        '最新的一个名字刻在台阶旁最显眼的位置，旁边注着一个日期，' +
        '墨迹还湿，显然是昨日或更近才刻下的，' +
        '那个人不知是初来乍到想留下印记，还是知道自己将有去无回。' +
        '台上常有一个人独立远眺，若有所思，是那个人称"燕七"的探子。',
    );
    this.set('coordinates', { x: -1, y: -1, z: 0 });
    this.set('exits', {
      east: 'area/frost-pass/main-street',
    });
  }
}
