/**
 * 酒馆老板金娘子 — 潮汐港·鲸吞酒馆
 * 泼辣精明的酒馆老板娘，消息灵通，八面玲珑
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class TavernKeeperJin extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '金娘子');
    this.set('short', '在吧台后面擦杯子的泼辣妇人');
    this.set(
      'long',
      '金娘子是个四十来岁的壮硕妇人，嗓门大得能压过整个酒馆的喧嚣。' +
        '她梳着利落的高髻，耳垂上挂着一对铜环，' +
        '穿着一件深红色的对襟褂子，腰间系着油腻的围裙。' +
        '她的眼睛精明得像老鹰，酒馆里谁多喝了一杯、谁少付了一文，' +
        '都逃不过她的眼。' +
        '据说她年轻时在东海跑过船，见过大风大浪，' +
        '后来上岸开了这家酒馆，靠的是三样东西：' +
        '好酒、好嘴皮子，和藏在柜台下面的一把柴刀。',
    );
    this.set('title', '');
    this.set('gender', 'female');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 17);
    this.set('max_hp', 700);
    this.set('hp', 700);
    this.set('combat_exp', 0);
    this.set('personality', 'shrewd');
    this.set('speech_style', 'folksy');
    this.set('chat_chance', 45);
    this.set('chat_msg', [
      '金娘子一边擦酒杯，一边尖着嗓子吆喝："喝酒的痛快付钱，赊账的趁早滚蛋！"',
      '金娘子斜眼瞅着角落里赌骰子的几个人，嘴角露出一丝了然的笑。',
      '金娘子从柜台下摸出一坛酒，拍掉泥封，酒香顿时弥漫了半个大堂。',
    ]);
    this.set('inquiry', {
      消息: '金娘子凑过来压低声音：「消息？这港里的消息比鱼还多。你想听哪种——免费的都是假的，真的要银子。你说吧，想打听什么？」',
      霍三刀: '金娘子撇撇嘴：「霍三刀那人，你别看他凶，其实精着呢。他不贪，就收该收的那份。换了别人管这港口，你信不信，保护费翻三倍都不止。」',
      酒: '金娘子拍拍柜台上的酒坛：「要喝什么？我这有东海的椰子酒，也有北地运来的烈烧刀。最好的那坛是从仙岛弄来的，不过嘛——你怕是喝不起。」',
      default: '金娘子扫了你一眼：「新面孔。坐下喝一杯吧，在我这不兴闹事。」',
    });
  }
}
