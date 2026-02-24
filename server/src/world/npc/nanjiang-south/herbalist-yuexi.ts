/**
 * 药师月溪 — 雾岚寨·药庐
 * 寨中药师，擅长采集南疆草药，性格温和，对外人并无敌意
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class HerbalistYuexi extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '月溪');
    this.set('short', '一个背着药篓的苗家女子');
    this.set(
      'long',
      '她约莫三十来岁，身着靛蓝对襟衣衫，衣角绣着几簇小小的草药图样。' +
        '背上的竹篓里装满了各色草药，散发出苦涩而清凉的气味。' +
        '她的手指因常年采药而粗糙发黑，指甲缝里嵌着洗不掉的草汁。' +
        '面容平和，眉间有一颗小小的朱砂痣，说话时总带着一种不紧不慢的腔调，' +
        '仿佛山里的日子本就该如此从容。' +
        '她正蹲在药炉前翻动着什么，偶尔拿起一片叶子对着光看，又放回药臼里研磨。',
    );
    this.set('title', '药师');
    this.set('gender', 'female');
    this.set('faction', Factions.BAI_MAN);
    this.set('visible_faction', '雾岚寨');
    this.set('attitude', 'friendly');
    this.set('level', 10);
    this.set('max_hp', 380);
    this.set('hp', 380);
    this.set('personality', 'gentle');
    this.set('speech_style', 'scholarly');
    this.set('chat_chance', 30);
    this.set('chat_msg', [
      '月溪从药篓里取出一把草药，仔细地按品种分拣到不同的竹匾里。',
      '月溪往药炉里添了一把柴火，炉中药汤翻滚，白色的蒸汽裹着苦香飘散开来。',
      '月溪用指甲掐了掐一片叶子的边缘，点点头自言自语道：「够老了，正好入药。」',
    ]);
    this.set('inquiry', {
      草药: '月溪放下手中的药杵，想了想：「南疆的草药跟中原不同，同一味药材，山阴山阳采的，药性能差一倍。你若想学，先得认路——认的不是人走的路，是草长的路。」',
      治病: '月溪擦了擦手：「小伤小病的，我这里有些成药，你拿去用便是。若是中了毒……那得看是什么毒，南疆的毒千奇百怪，有些连我也要请教玲珑才行。」',
      蛊毒: '月溪摇摇头：「蛊的事你去问玲珑。我只管草药，蛊虫那些我不碰——不是不会，是不敢。草药是死物，蛊虫是活的，活的东西不好控制。」',
      default: '月溪抬头看了你一眼，笑了笑：「外面来的？坐吧，喝碗凉茶。山路难走，歇歇脚。」',
    });
  }
}
