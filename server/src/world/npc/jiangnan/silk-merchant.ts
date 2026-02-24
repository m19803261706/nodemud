/**
 * 绸缎商盛三娘 — 烟雨镇·锦绣绸缎庄
 * 精明的女商人，人脉广泛，暗中与各方势力都有生意往来
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class SilkMerchant extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '盛三娘');
    this.set('short', '拨着算盘的精明妇人');
    this.set(
      'long',
      '盛三娘年近四旬，保养得宜，面容白净，一双丹凤眼透着精明。' +
        '她穿着一身裁剪得体的湖蓝锦缎衫裙，领口别着一枚翡翠扣，' +
        '手腕上叠着三只细金镯，走动时发出细碎的声响。' +
        '她说话时嘴角总带着恰到好处的笑意，' +
        '让人分不清她是在恭维你还是在算计你。' +
        '据说整个烟雨镇的布匹生意有七成过她的手，' +
        '连官府的采买都要给她几分面子。',
    );
    this.set('title', '锦绣绸缎庄 掌柜');
    this.set('gender', 'female');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '锦绣绸缎庄');
    this.set('attitude', 'friendly');
    this.set('level', 9);
    this.set('max_hp', 350);
    this.set('hp', 350);
    this.set('combat_exp', 0);
    this.set('personality', 'cunning');
    this.set('speech_style', 'formal');
    this.set('chat_chance', 45);
    this.set('chat_msg', [
      '盛三娘拨了拨算盘，满意地点了点头，在账本上记下一笔。',
      '盛三娘展开一匹新到的云锦，对着光线细细端详。',
      '盛三娘低声吩咐伙计将一批货送往码头，神情严肃。',
      '盛三娘招呼客人试穿新衣，嘴上不停地夸赞，手却在暗暗整理袖中的信笺。',
    ]);
    this.set('inquiry', {
      丝绸:
        '盛三娘笑着引你到柜台前：「这匹是苏绣，这匹是蜀锦，' +
        '各有各的好。不过最顶好的料子嘛……要看您出得起什么价。' +
        '三娘做生意实在，从不虚报。」',
      消息:
        '盛三娘压低声音，靠近了些：「做生意嘛，耳朵灵是本钱。' +
        '最近镇上来了些外地人，不像是做买卖的……你若有兴趣，' +
        '买两匹绸缎，三娘多送你两句闲话。」',
      default:
        '盛三娘热情地迎上来：「哎呀，客官好眼光！进来看看，' +
        '我这里的料子全烟雨镇找不出第二家，价格公道，童叟无欺。」',
    });
  }
}
