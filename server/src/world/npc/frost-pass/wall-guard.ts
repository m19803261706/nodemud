/**
 * 城墙守卒 — 朔云关·西段城墙/东段城墙
 * 巡逻城墙的普通士兵，疲惫但尽职
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class WallGuard extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '城墙守卒');
    this.set('short', '一个裹着棉甲、扛着长矛的守卒');
    this.set(
      'long',
      '二十多岁，面色发青，嘴唇被冻得发紫，' +
        '但仍然挺直腰板站在垛口旁。' +
        '棉甲外面套着一件破旧的罩衫，被风吹得猎猎作响。' +
        '手中的长矛杆上缠着布条以防打滑，矛尖微微发亮。' +
        '他每隔一刻就沿城墙来回走一趟，' +
        '脚步机械而沉重，像是已经走了无数遍。' +
        '偶尔停下来往垛口外望一望，确认没有异常，' +
        '然后继续走。' +
        '他不怎么说话，大概是冷的，也大概是困的——' +
        '城墙上的夜班是最难熬的差事。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.CHENG_TIAN);
    this.set('visible_faction', '承天朝');
    this.set('attitude', 'friendly');
    this.set('level', 7);
    this.set('max_hp', 220);
    this.set('hp', 220);
    this.set('personality', 'stern');
    this.set('speech_style', 'terse');
    this.set('chat_chance', 30);
    this.set('chat_msg', [
      '城墙守卒搓了搓冻红的手，往手心哈了口热气，然后重新握紧长矛。',
      '城墙守卒倚着垛口往北望了一眼，没看到什么异常，缩回头继续巡逻。',
      '城墙守卒跺了跺脚，低声嘟囔了一句什么，大概是在抱怨天气。',
    ]);
    this.set('inquiry', {
      巡逻: '城墙守卒看你一眼：「没什么好巡的，天天都一样。往北看，草原，往南看，关城。偶尔远处有黑点移动，报上去，石教头派人出去看，回来说是野狼。但谁知道呢？北漠人跟狼一样狡猾。」',
      换防: '城墙守卒叹了口气：「本来两个时辰一轮换，但人手不够，现在是四个时辰。冬天四个时辰站在城墙上，你试试？站到最后腿都不是自己的了。」',
      default: '城墙守卒摆摆手：「别在城墙上逗留，挡路。」',
    });
  }
}
