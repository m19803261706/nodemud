/**
 * 幕僚陈良 — 洛阳废都·废弃府衙
 * 承天朝留守文官，三个月没收到朝廷来信，仍在坚守职务，
 * 公文一份份批，却不知还有没有人在意
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class GovernorAide extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '陈良');
    this.set('short', '一个面容消瘦的中年文官');
    this.set(
      'long',
      '一个穿着七品文官常服的中年男子，官服洗得发白，领口仍然整齐。' +
        '他面容消瘦，颧骨突出，眼睛里有一种说不清是尽职还是麻木的执拗神情。' +
        '桌上的公文叠了足有一尺高，他手边的砚台磨得见底，却还在一笔一画地写着什么。' +
        '左手无名指上戴着一枚刻有"陈"字的铜印，是他幕僚身份最后的凭证。',
    );
    this.set('title', '幕僚');
    this.set('gender', 'male');
    this.set('faction', Factions.CHENG_TIAN);
    this.set('visible_faction', '承天朝');
    this.set('attitude', 'friendly');
    this.set('level', 12);
    this.set('max_hp', 400);
    this.set('hp', 400);
    this.set('personality', 'pragmatic');
    this.set('speech_style', 'formal');
    this.set('chat_chance', 35);
    this.set('chat_msg', [
      '陈良翻着公文叹气：「报上去也没人批，不报上去又不合规矩……」他最终还是落了笔，在文书上盖章。',
      '陈良用毛笔在废纸背面练字，笔画工整，透着一种久经案牍的疲倦。',
      '陈良望了一眼窗外满院荒草，低声道：「这座城，还能守多久呢。」',
    ]);
    this.set('inquiry', {
      朝廷:
        '陈良苦笑，放下手中的笔：「朝廷？已经三个月没来人了。留守令是前任大人留下的，粮饷是存的，我也不知道自己还算不算承天朝的官。」他顿了顿，又拿起笔，「但规矩还在，我就还做。」',
      废都:
        '陈良放下笔，压低声音：「这里各方势力犬牙交错，暗河堂、碧澜阁都有人在城里走动，我只能装作看不见。能维持不乱就行——乱了，谁也不好过。」',
      陈良:
        '陈良淡淡地道：「一个守着空壳子的文官，没什么好说的。您若是有正事，说来听听；若只是闲聊，恕我案头忙，改日再叙。」',
      default:
        '陈良头也不抬：「有事说事，没事别打扰，公文还堆着呢。」他翻过一张文书，毛笔已经悬在砚台边了。',
    });
  }
}
