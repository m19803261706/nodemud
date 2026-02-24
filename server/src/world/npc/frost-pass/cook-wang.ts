/**
 * 伙夫老王 — 朔云关·伙房
 * 脾气暴躁的伙夫，做的饭不好吃但管饱，没人敢挑他的毛病
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class CookWang extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '老王');
    this.set('short', '一个挥着大勺、满头油烟的胖伙夫');
    this.set(
      'long',
      '圆滚滚的身材在边关显得格外扎眼——能在这苦寒之地吃出一身膘的，' +
        '只有伙房的人。秃顶，脑门上常年挂着汗珠，' +
        '围裙系不住肚子，老是往下滑。' +
        '手里的大铁勺几乎不离手，搅粥的时候是勺子，' +
        '谁敢偷吃就变成了武器——一勺拍过去，那个响亮。' +
        '他做的饭菜不好吃，但从没让人饿过肚子，' +
        '在粮食紧缺的时候，他能把一锅清水变出花来。' +
        '脾气臭，嘴巴碎，但谁也不会真跟他计较——' +
        '毕竟伙夫得罪不起，这是军中铁律。',
    );
    this.set('title', '伙夫');
    this.set('gender', 'male');
    this.set('faction', Factions.CHENG_TIAN);
    this.set('visible_faction', '承天朝');
    this.set('attitude', 'friendly');
    this.set('level', 6);
    this.set('max_hp', 200);
    this.set('hp', 200);
    this.set('personality', 'grumpy');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 50);
    this.set('chat_msg', [
      '老王挥着大勺在锅里搅了两圈，尝了一口，皱着眉嘟囔：「淡了，盐又快没了。」',
      '老王一勺拍在一个偷伸手的兵丁手背上：「排队！都给我排队！不排队没得吃！」',
      '老王蹲在灶前添柴，自言自语：「这点粮食，再省也撑不过下月了……」',
    ]);
    this.set('inquiry', {
      吃饭: '老王白了你一眼：「吃饭？粥在锅里，自己盛。一人一碗，不许多拿。咸菜在缸里，自己夹。肉？你做梦呢，上个月的鹿肉早分完了，下顿有肉得等猎户出关。」',
      粮食: '老王叹了口气，难得收起了暴脾气：「不瞒你说，库里的粮只够吃到二月。朝廷的粮车每次都迟到，有时候干脆不来。上次断粮的时候，我拿草根煮汤，兵爷们喝了照样上城墙打仗。你说人啊，饿不死就不会死。」',
      default: '老王头也不抬：「想吃就端碗来，没事别在灶前杵着，碍事！」',
    });
  }
}
