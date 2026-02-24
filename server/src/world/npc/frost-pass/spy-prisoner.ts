/**
 * 北漠细作 — 朔云关·地牢
 * 被关押的北漠间谍，沉默顽固，偶尔用中原话嘲讽守卫
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class SpyPrisoner extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '被囚细作');
    this.set('short', '一个被铁链锁在墙上、沉默不语的囚犯');
    this.set(
      'long',
      '蓬头垢面，衣衫褴褛，被两根粗铁链锁在牢房的石墙上。' +
        '面容消瘦，但骨架宽大，能看出身体底子不差。' +
        '他的眼窝深陷，眼神却异常锐利，' +
        '在昏暗的油灯下闪着不屈的光。' +
        '左耳上方有一个明显的刀疤，据说是审讯时留下的——' +
        '关令让人割了他的耳朵来逼供，但他一个字都没说。' +
        '他是上个月在城墙附近被抓获的北漠细作，' +
        '身上搜出了绘制关城布防图的工具和几封密信。' +
        '至今关令都没能从他嘴里得到有用的情报。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.LANG_TING);
    this.set('visible_faction', '北漠·狼庭');
    this.set('attitude', 'hostile');
    this.set('level', 9);
    this.set('max_hp', 200);
    this.set('hp', 120);
    this.set('personality', 'stern');
    this.set('speech_style', 'terse');
    this.set('chat_chance', 15);
    this.set('chat_msg', [
      '被囚细作靠在墙上闭着眼，铁链偶尔发出轻微的碰撞声。',
      '被囚细作睁开眼，冷冷地盯着你看了一会儿，然后又闭上，不发一言。',
      '被囚细作的嘴角微微抽动了一下，不知是在冷笑还是在忍受疼痛。',
    ]);
    this.set('inquiry', {
      情报: '被囚细作慢慢睁开眼，用字正腔圆的中原话说：「你们想知道的，比你们已经知道的多得多。可惜——」他扯了扯铁链，「这些铁链锁得住我的身体，锁不住狼庭的铁骑。等草青的时候，你们就知道了。」',
      default: '被囚细作闭着眼，像是没听到你说话。过了半晌，他嘴角动了动：「……滚。」',
    });
  }
}
