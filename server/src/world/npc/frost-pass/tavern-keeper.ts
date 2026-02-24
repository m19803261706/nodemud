/**
 * 掌柜娘赵嫂 — 朔云关·霜刀客栈
 * 客栈老板娘，泼辣能干，消息灵通，是关城的非官方情报中心
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class TavernKeeper extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '赵嫂');
    this.set('short', '一个系着围裙、面色红润的中年妇人');
    this.set(
      'long',
      '三十多岁，面色红润，身材壮实，一看就是干惯了粗活的人。' +
        '头发用一块蓝布巾扎在脑后，额前散着几缕碎发。' +
        '围裙上沾着油渍和酒渍，手上还残留着切肉的腥味。' +
        '她嗓门大，笑声更大，招呼客人的时候声音能穿过整条街。' +
        '别看她是个妇道人家，关城上下没人敢惹她——' +
        '据说她丈夫是当年阵亡的骑兵百夫长，' +
        '她一个人把客栈撑了下来，还把两个儿子拉扯大了。' +
        '她消息灵通得出奇，关城里谁跟谁有过节、' +
        '哪个兵偷喝了军需库的酒，她都一清二楚。',
    );
    this.set('title', '霜刀客栈掌柜');
    this.set('gender', 'female');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 6);
    this.set('max_hp', 200);
    this.set('hp', 200);
    this.set('personality', 'warm');
    this.set('speech_style', 'casual');
    this.set('chat_chance', 50);
    this.set('chat_msg', [
      '赵嫂麻利地擦着桌子，顺手把一碗热粥推到一个打盹的老兵面前：「喝，凉了就不好喝了。」',
      '赵嫂倚着柜台，嗑着瓜子，目光在堂中扫了一圈，似乎在评估每个客人的底细。',
      '赵嫂朝后厨吆喝了一声：「老二！把那锅骨头汤端出来，火候到了！」',
    ]);
    this.set('inquiry', {
      消息: '赵嫂凑过来压低嗓门：「你想知道什么？关城里的事，没有我赵嫂不知道的。不过嘛，消息分两种——免费的和值钱的。免费的：最近从南边来了几个形迹可疑的人，住在客栈不出门。值钱的嘛……请我喝碗酒再说。」',
      住店: '赵嫂拍拍柜台：「住店？有房间，上等间一晚五十文，铜钱银子都行。普通的二十文，给你换干净的被褥。最便宜的十文，大通铺，跟兵爷们挤一挤。不过说好了，客栈里不许打架，打坏了东西照价赔。」',
      default: '赵嫂爽快地说：「坐吧，先来碗热的暖暖身子！」',
    });
  }
}
