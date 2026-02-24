/**
 * 水匪头目 — 烟雨镇·河畔仓库
 * 暗中控制仓库区走私通道的水匪头目，危险人物
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class WaterBanditChief extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '水匪头目');
    this.set('short', '面带刀疤的冷峻男子');
    this.set(
      'long',
      '这男子三十出头的年纪，身材精悍，穿着一件黑色的紧身短褐，' +
        '右脸上从耳根到嘴角有一道触目惊心的刀疤，' +
        '疤痕发白，衬得他的表情更加冷酷。' +
        '他的目光锋利如刀，打量人时习惯从头到脚扫一遍，' +
        '像是在评估对方的战斗力。' +
        '腰间佩着一把环首刀，刀柄上缠着鲨鱼皮，是水上人惯用的样式。' +
        '他在仓库区来去自如，巡逻的官差见了他都绕着走，' +
        '这份底气不知是来自他身后的势力，还是他手中的刀。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 11);
    this.set('max_hp', 480);
    this.set('hp', 480);
    this.set('combat_exp', 65);
    this.set('personality', 'aggressive');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 30);
    this.set('chat_msg', [
      '水匪头目双臂抱胸靠在仓库门上，冷冷地注视着周围的动静。',
      '水匪头目低声对身边的手下吩咐了几句，手下点头快步离去。',
      '水匪头目抽出环首刀查看刀刃，满意地舔了舔嘴唇。',
    ]);
    this.set('inquiry', {
      走私:
        '水匪头目眯起眼睛，嘴角挑起一个危险的弧度：' +
        '「走私？你是来找死的还是来做买卖的？' +
        '如果是后者，你找错人了。如果是前者……那正合我意。」',
      default:
        '水匪头目冰冷的目光扫过来：「这一带不欢迎外人。' +
        '识相的赶紧离开，不识相的……我不介意多添一条刀疤。」',
    });
  }
}
