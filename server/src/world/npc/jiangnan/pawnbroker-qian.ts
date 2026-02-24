/**
 * 当铺掌柜钱有余 — 烟雨镇·万通当铺
 * 暗河在烟雨镇的联络人，表面经营当铺，暗中倒卖赃物和情报
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class PawnbrokerQian extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '钱有余');
    this.set('short', '铁栅栏后面的精瘦男子');
    this.set(
      'long',
      '钱有余生得瘦小，一张脸窄长如刀，颧骨突出，' +
        '两只三角眼总是微微眯着，像是在算计什么。' +
        '他穿着一件暗灰色的绸褂，虽不起眼，料子却是上等的。' +
        '手里永远拿着一把鎏金算盘，手指骨节分明，拨珠子的速度快得惊人。' +
        '他坐在高高的柜台后面，隔着铁栅栏俯视每一个进来的人，' +
        '那居高临下的角度让他看起来比实际身量高了不少。' +
        '有人说他跟暗河有些说不清的关系，但谁也拿不出证据。',
    );
    this.set('title', '万通当铺 掌柜');
    this.set('gender', 'male');
    this.set('faction', Factions.AN_HE);
    this.set('visible_faction', '万通当铺');
    this.set('attitude', 'neutral');
    this.set('level', 11);
    this.set('max_hp', 450);
    this.set('hp', 450);
    this.set('combat_exp', 0);
    this.set('personality', 'cunning');
    this.set('speech_style', 'sly');
    this.set('chat_chance', 30);
    this.set('chat_msg', [
      '钱有余拨着算盘珠子，发出清脆的咔嗒声，目光却盯着门口。',
      '钱有余从柜台下面取出一本账册翻了翻，神色若有所思。',
      '钱有余把一件典当品翻来覆去地看，嘴角浮起一丝不易察觉的冷笑。',
    ]);
    this.set('inquiry', {
      典当:
        '钱有余隔着铁栅栏打量你手中的东西，眼珠转了转：' +
        '「东西拿来看看……嗯，品相一般。出这个价，爱当不当。' +
        '嫌少？隔壁镇还有当铺，不过他们可不像我这般实在。」',
      暗门:
        '钱有余的表情一瞬间冷了下来，声音压得极低：' +
        '「什么暗门不暗门的，当铺就是当铺。' +
        '你若只是来当东西的，我们好好做买卖。' +
        '别的事……你问错人了。」',
      default:
        '钱有余从栅栏缝里扫了你一眼：「典当还是赎当？' +
        '典当的把东西递进来，赎当的拿票来。' +
        '没事别在这杵着，影响我做生意。」',
    });
  }
}
