/**
 * 看守老刀 — 洛阳废都·武道场遗址
 * 无门无派的老武人，守着武道场，磨着一把缺口环首刀，
 * 来历不明，左手少了两根手指，知道那道裂痕的来历
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class ArenaKeeper extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '老刀');
    this.set('short', '一个断了两根手指的老者');
    this.set(
      'long',
      '一个年约六旬的老者，坐在武道场台下的石墩上，身形干瘦却腰背笔直，像一根老铁枪杆。' +
        '他左手残缺，无名指与小指只剩两截残根，但握刀的右手稳若磐石，正慢慢磨着一把环首刀。' +
        '那把刀刃口有一道明显的缺口，磨了多年也没磨掉，反而越磨越光滑，像是他与这道缺的某种默契。' +
        '他的眼睛深陷，大多数时候盯着武道场中央那道一丈长的裂痕，久到像是在和它说话。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('attitude', 'friendly');
    this.set('level', 18);
    this.set('max_hp', 600);
    this.set('hp', 600);
    this.set('personality', 'stern');
    this.set('speech_style', 'terse');
    this.set('chat_chance', 20);
    this.set('chat_msg', [
      '老刀慢慢磨着手中的缺口环首刀，刀面映出他沟壑纵横的脸，看不出在想什么。',
      '老刀盯着武道场中央的裂痕出神，半天没有眨眼，连磨刀的手都停了。',
      '老刀活动了一下残缺的左手，骨节咔咔作响，他看了一眼，又继续磨刀。',
    ]);
    this.set('inquiry', {
      武道场:
        '老刀用缺口刀指了指石台中央那道裂痕：「那一刀，是二十年前的事了。」他顿了顿，「出刀的人后来死了，挨刀的人也死了，只有这道痕还在。」他没有再说什么。',
      裂痕:
        '老刀放下磨刀石，看了你一眼：「见过的人都想问。」他站起来走到裂缝边，俯身看了看底部隐约的微光，「我守了二十年，也没弄明白。」他退回石墩，重新拿起刀。',
      手指:
        '老刀看了看自己的左手，语气比说天气还平淡：「被人砍的。不算什么，命还在。」',
      default:
        '老刀抬眼看了你一眼，又低下头继续磨刀，没有说话。石头与钢铁摩擦的声音沙沙响着。',
    });
  }
}
