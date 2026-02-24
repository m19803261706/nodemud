/**
 * 茶摊老翁 — 官道·中原段
 * 路边茶摊的经营者，经历过乱世的老人，卖粗茶为生
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class OldTeaSeller extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '茶摊老翁');
    this.set('short', '一位卖茶的花白老翁');
    this.set(
      'long',
      '一个头发花白的老翁，面色黝黑，皱纹深刻如刀削，' +
        '穿着一件洗得发白的粗布褂子，腰间系着条灰扑扑的围裙。' +
        '他弓着腰在土灶前忙活，手脚虽慢但极为利落，' +
        '泡茶、添柴、收碗一气呵成。' +
        '据说他年轻时也是走南闯北的行脚商，' +
        '后来在一场兵祸中伤了腿，便在这路边支了个摊子，' +
        '靠卖粗茶过活，一待就是二十几年。' +
        '往来的行人都叫他"老陈头"。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 3);
    this.set('max_hp', 80);
    this.set('hp', 80);
    this.set('personality', 'warm');
    this.set('speech_style', 'colloquial');
    this.set('chat_chance', 40);
    this.set('chat_msg', [
      '茶摊老翁往灶膛里添了把柴，火苗子窜起来，映得他脸上的皱纹更深了。',
      '茶摊老翁慢悠悠地擦着茶碗，嘴里哼着一支不知名的小调。',
      '茶摊老翁抬头望了望天色，自言自语道："今儿个怕是要变天了。"',
      '茶摊老翁把一碗热茶递给路过的行人，笑着摆了摆手，不要钱。',
    ]);
    this.set('inquiry', {
      茶: '茶摊老翁笑着倒了碗茶推过来：「粗茶，不值什么。赶路累了喝两口润润嗓子，比喝凉水强。」',
      路: '茶摊老翁努了努嘴：「往南走，过了那片废村和旧战场，就能看见洛阳的城墙了。不远，半天脚程。往北走嘛……裂隙镇在那头。路上小心盗匪就是。」',
      default:
        '茶摊老翁擦了擦手，笑了笑：「客官请坐，喝碗茶歇歇脚。这路上人来人往的，什么人我都见过，什么事我都听过。您不嫌弃就坐着歇会儿。」',
    });
  }
}
