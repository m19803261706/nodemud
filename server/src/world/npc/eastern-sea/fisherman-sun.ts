/**
 * 渔夫孙大海 — 潮汐港·渔人栈桥
 * 在潮汐港讨了半辈子生活的老渔民，熟悉每一片海域
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class FishermanSun extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '孙大海');
    this.set('short', '蹲在桥头补网的老渔民');
    this.set(
      'long',
      '孙大海是个五十多岁的壮实汉子，皮肤被海风和烈日晒成了深褐色，' +
        '额头和眼角的皱纹像刀刻的一样深。' +
        '他穿着一件打满补丁的短褂，裤腿高高挽起，' +
        '赤脚踩在湿滑的栈桥上，稳得像是生了根。' +
        '手里的鱼线穿针引线飞快，一张破了大洞的渔网在他手下逐渐恢复完整。' +
        '他在这片海打了三十年的鱼，知道哪片礁石下有好货，' +
        '哪个时辰潮水最险。海盗和官兵他都见过，但从不站队——' +
        '渔民只跟海打交道，海不讲道理，但至少不骗人。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 15);
    this.set('max_hp', 500);
    this.set('hp', 500);
    this.set('combat_exp', 0);
    this.set('personality', 'honest');
    this.set('speech_style', 'folksy');
    this.set('chat_chance', 40);
    this.set('chat_msg', [
      '孙大海叼着旱烟，眯眼望向海面，嘟囔道："今天这浪，怕是有大鱼。"',
      '孙大海把补好的网抖开检查，满意地点了点头，又开始补下一张。',
      '孙大海对着海面吐了口烟，感慨道："这辈子啊，就跟这海一样，起起落落。"',
    ]);
    this.set('inquiry', {
      海况: '孙大海抬头看了看天色，说道：「最近东南风大，近海的鱼都往深处跑了。不过沉船墓地那边倒是有不少螃蟹，就看你敢不敢去。」',
      潮汐港:
        '孙大海叹了口气：「这港口啊，水太浑。不过咱渔民管不了那么多，能打到鱼就行。霍三刀的保护费虽然狠了点，但至少没让外面的人来抢我们的鱼。」',
      沉船墓地:
        '孙大海压低声音：「那地方邪门得很。退潮的时候去，能捡到不少好东西——铜钱、银器，还有些叫不上名的玩意。但别赶上涨潮，淹死过好几个了。」',
      default: '孙大海笑呵呵地说：「年轻人，想尝尝刚打上来的鲜鱼不？自己烤的，不要钱。」',
    });
  }
}
