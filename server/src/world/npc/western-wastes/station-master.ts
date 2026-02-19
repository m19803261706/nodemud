/**
 * 驿长萨木哈 — 黄沙驿·集市
 * 黄沙驿驿长，精通多国语言，是丝路上最重要的信息中枢
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class StationMaster extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '萨木哈');
    this.set('short', '一个正在拨弄算盘的西域中年男子');
    this.set(
      'long',
      '他面相圆润，留着整齐的胡须，眼睛略小，但注意力极强——' +
        '什么东西都逃不过他的眼睛。' +
        '身着质地考究的西域袍服，腰间系着宽皮带，皮带上挂着一串钥匙和一个算盘，' +
        '拨算盘的手指快得让人看不清楚。' +
        '他能用至少五种语言做生意，见到不同来路的客人自动切换，' +
        '丝毫不显露任何立场，这种中立让他在各方势力眼中都算得上「可靠」。' +
        '但这种可靠是有价的——他清楚地知道每一条情报值多少钱。',
    );
    this.set('title', '驿长');
    this.set('gender', 'male');
    this.set('faction', Factions.XI_YU);
    this.set('visible_faction', '黄沙驿');
    this.set('attitude', 'friendly');
    this.set('level', 20);
    this.set('max_hp', 900);
    this.set('hp', 900);
    this.set('personality', 'cunning');
    this.set('speech_style', 'merchant');
    this.set('chat_chance', 45);
    this.set('chat_msg', [
      '萨木哈拨弄着算盘，噼里啪啦，头也不抬地回复着各种问题。',
      '萨木哈同时用三种语言和不同的商人说话，每一句都没有说错，让旁观者啧啧称奇。',
      '萨木哈端着茶杯慢慢品，眼神在来往的客人身上一一扫过，什么都进眼睛，什么都不说出来。',
      '萨木哈把一叠账单往怀里一收，站起来招呼新来的驼队，笑容职业而温暖。',
    ]);
    this.set('inquiry', {
      情报: '萨木哈放下算盘，两手交叉放在桌上，微微前倾：「消息是有价的，朋友。你想知道什么，先告诉我你能出什么价，我们再谈。」',
      遗迹: '萨木哈眯起眼睛：「太古遗城？有人去过，回来的不多。」他顿了顿，「你若真有兴趣，找到遗迹商白狐，他比我清楚那边的情况。」',
      西域: '萨木哈展开双手，做了个大而化之的手势：「西域大得很，我这里只管丝路这一段。但丝路的事，没什么是我不知道的。」',
      萨木哈: '他笑了笑：「认识我是你的运气，朋友。」',
      default: '萨木哈抬起头，脸上挂着那种熟练了无数遍的笑容：「东边的货，西边的价。朋友，要不要看看？」',
    });
  }
}
