/**
 * 关令贺孟川 — 朔云关·守将府
 * 驻守朔云关的关令，性格严峻，承天朝忠臣，掌管北境防线
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class BorderCaptain extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '贺孟川');
    this.set('short', '一位甲胄在身、神色凝重的关令');
    this.set(
      'long',
      '年约五旬，鬓发已斑白，却腰背挺直，一副武将风骨。' +
        '面上有多条浅疤，是多年边关征战留下的印记，' +
        '眼神深邃而锐利，像是见过太多事之后沉淀下来的冷静。' +
        '他总是穿着甲胄，据说连睡觉都不完全脱下，' +
        '因为北漠骑兵偷袭来得太快，脱甲再披甲的工夫有时就是生死之差。' +
        '嘴角常抿成一条线，不轻易开口，但一旦说话，字字掷地有声。' +
        '他是承天朝这条北境防线上最后一根真正的钉子。',
    );
    this.set('title', '朔云关关令');
    this.set('gender', 'male');
    this.set('faction', Factions.CHENG_TIAN);
    this.set('visible_faction', '承天朝');
    this.set('attitude', 'friendly');
    this.set('level', 20);
    this.set('max_hp', 800);
    this.set('hp', 800);
    this.set('personality', 'stern');
    this.set('speech_style', 'formal');
    this.set('chat_chance', 40);
    this.set('chat_msg', [
      '贺孟川低头审阅着案几上的军报，眉头微皱，时而在某处用朱笔圈注。',
      '贺孟川走到舆图前，凝视北境某处烽燧的位置，长叹一口气。',
      '贺孟川背着手在堂中踱步，沉声道：「粮草又短了三成，枢密院那边还是没有回复。」',
    ]);
    this.set('inquiry', {
      北境: '贺孟川转过身，神色凝重：「北边不太平。狼庭新王继位，整合了三个部落，近来骑哨频繁靠近关墙。是试探，也可能是前兆。朝廷知道，但朝廷有朝廷的难处。」他顿了顿，补充道：「你若在外行走，小心些。」',
      军功:
        '贺孟川审视你片刻：「若你真有本事，关外有几处北漠游骑的巢穴需要清剿。' +
        '每带回一枚北漠骑兵的腰牌，本关按军功记赏，银两从关防库里出。' +
        '不过丑话说在前头——出了关，死活自负。」',
      default: '贺孟川抬眼看你一眼：「关外死得，关内不行。有事说事。」',
    });
  }
}
