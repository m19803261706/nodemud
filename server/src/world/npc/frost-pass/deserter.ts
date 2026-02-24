/**
 * 逃兵陈三 — 朔云关·西角楼
 * 受不了边关苦寒的逃兵，胆小怕事，在角楼里瑟缩等待逃跑的机会
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class Deserter extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '陈三');
    this.set('short', '一个畏畏缩缩、目光闪烁的年轻兵卒');
    this.set(
      'long',
      '二十出头，面色苍白，嘴唇干裂，一看就是几天没好好吃饭的样子。' +
        '穿着一件破旧的棉甲，但甲上的标志已经被他撕掉了。' +
        '他蹲在角楼的角落里，双手抱着膝盖，' +
        '听到动静就猛地抬头，眼里满是惊恐。' +
        '他的手指不停地抖，不知道是冷的还是怕的。' +
        '身旁放着一个小包袱，里面鼓鼓囊囊的，' +
        '大概是他逃跑用的行李。' +
        '他不断地向窗口张望，似乎在等待某个时机——' +
        '一个能让他溜出关城的夜晚。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'neutral');
    this.set('level', 6);
    this.set('max_hp', 150);
    this.set('hp', 150);
    this.set('personality', 'fearful');
    this.set('speech_style', 'casual');
    this.set('chat_chance', 25);
    this.set('chat_msg', [
      '陈三听到脚步声，猛地缩进角落，过了好一会儿才探出头来。',
      '陈三低着头抠着指甲，嘴里嘟囔着什么，声音小得听不清。',
      '陈三偷偷看了一眼窗外，又赶紧缩回去，表情紧张。',
    ]);
    this.set('inquiry', {
      逃跑: '陈三惊恐地看着你：「你……你要干什么？你是来抓我的？我没有逃！我只是……只是出来透透气！」他语无伦次地说了一阵，然后低下头，声音变得很小，「求你别告诉石教头……被抓回去就是二十军棍，上次有个逃兵被活活打死了……」',
      边关: '陈三的眼圈红了：「我不想死在这里。我家在南边，我娘还等着我回去。我是被征来的，不是自愿的。这破地方，冷得要命，吃不饱穿不暖，天天都有人死……我受不了了。」他抹了抹眼睛，「你……你能不能帮我？帮我出关？」',
      default: '陈三畏缩地看你一眼：「别……别大声说话……会被巡逻的听到……」',
    });
  }
}
