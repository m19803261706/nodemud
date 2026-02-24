/**
 * 老渔夫陈阿根 — 烟雨镇·渔村
 * 世代在此打鱼的老渔夫，朴实憨厚，熟知水路
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class FishermanChen extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '陈阿根');
    this.set('short', '蹲在水边补网的老渔夫');
    this.set(
      'long',
      '陈阿根是个黑瘦的老头，满脸的皱纹像是被风干的橘子皮。' +
        '他穿着一件补丁摞补丁的粗布短褂，裤腿卷到膝盖上方，' +
        '一双赤脚踩在泥地里，脚板宽大而粗糙，' +
        '是常年光脚踩船板踩出来的。' +
        '手里的渔网补了又补，他的手法却又快又稳。' +
        '偶尔抬头望一眼河面，凭风向水色就能判断今天的鱼况，' +
        '这是祖祖辈辈传下来的本事。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 6);
    this.set('max_hp', 250);
    this.set('hp', 250);
    this.set('combat_exp', 0);
    this.set('personality', 'honest');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 50);
    this.set('chat_msg', [
      '陈阿根蹲在水边，手里穿针引线地补着渔网，嘴里哼着不成调的渔歌。',
      '陈阿根往水里丢了块面饼，看着鱼群争抢，咧嘴笑了。',
      '陈阿根把新补好的渔网在竹竿上展开晾晒，拍了拍手上的灰。',
      '陈阿根望了眼天色，自言自语道：「今儿风向不对，怕是要变天。」',
    ]);
    this.set('inquiry', {
      水路:
        '陈阿根挠了挠头：「水路的事我倒知道些。' +
        '往西出镇走官道，往东出码头可以坐船到东海。' +
        '不过这几年河里不太平，夜里常听见船底有东西在刮，' +
        '不晓得是暗桩还是什么……」',
      渔村:
        '陈阿根叹了口气：「我们家祖祖辈辈在这打鱼，' +
        '日子虽然苦些，总归还过得去。就是近来那些人老来渔村附近转悠，' +
        '也不知道在找什么，搞得大家心里不踏实。」',
      default:
        '陈阿根抬头看了你一眼：「哟，是外地来的吧？' +
        '我们这渔村没啥好东西，就鱼多。你要买鱼不？新鲜的，便宜。」',
    });
  }
}
