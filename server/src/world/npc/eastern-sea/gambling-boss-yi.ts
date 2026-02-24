/**
 * 赌坊老板独眼易 — 潮汐港·骰子赌坊
 * 精明的独眼赌坊老板，在赌桌上从不输
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class GamblingBossYi extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '独眼易');
    this.set('short', '坐在高台上拨弄算盘的独眼老头');
    this.set(
      'long',
      '独眼易是个精瘦的老头，左眼上蒙着一块黑色的皮眼罩，' +
        '据说那只眼是被人用骰子砸瞎的——但他自己从不提这事。' +
        '他的右眼锐利得像鹰，能从三丈外看清骰子的点数。' +
        '他穿着一件半新不旧的锦缎马褂，' +
        '手里拨弄着一把乌木算盘，珠子碰撞的声音清脆悦耳。' +
        '在他的赌坊里，规矩比外面大：' +
        '可以赢，可以输，但不许出千——被抓到的人，' +
        '轻则断指，重则喂鱼。' +
        '他自己却从来不赌，因为在他眼里，' +
        '赌坊本身就是一场他永远不会输的赌局。',
    );
    this.set('title', '赌坊老板');
    this.set('gender', 'male');
    this.set('faction', Factions.SAN_MENG);
    this.set('visible_faction', '潮汐港');
    this.set('attitude', 'neutral');
    this.set('level', 19);
    this.set('max_hp', 750);
    this.set('hp', 750);
    this.set('combat_exp', 0);
    this.set('personality', 'cunning');
    this.set('speech_style', 'sly');
    this.set('chat_chance', 30);
    this.set('chat_msg', [
      '独眼易拨了两下算盘，嘴角微微上扬——又有人输了一大笔。',
      '独眼易的独眼扫过赌场，目光在某张桌子上多停了一瞬，随即移开。',
      '独眼易从袖中掏出一枚铜骰子在指间翻转，动作行云流水。',
    ]);
    this.set('inquiry', {
      赌: '独眼易拨了下算盘，不紧不慢地说：「想赌？规矩先听好：骰子我提供，银子你自备，出千我断手。公平得很。」',
      规矩: '独眼易竖起一根手指：「就一条——在我这赌坊里，拳头不好使，银子才好使。输了想翻本，拿钱来。输了想动手，那就看我手下答不答应。」',
      default: '独眼易瞟了你一眼：「赌不赌？不赌别挡道。」',
    });
  }
}
