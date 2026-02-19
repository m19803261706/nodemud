/**
 * 毒蛇 — 山路·蛮疆段
 * 蛮疆竹林中的毒蛇，低级敌对野怪
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class PoisonSnake extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '毒蛇');
    this.set('short', '一条在草丛中游动的毒蛇');
    this.set(
      'long',
      '一条约有一米长的蛇，鳞片呈深绿色间杂黑色的菱形花纹，' +
        '在竹林昏暗的光线下几乎与草丛融为一体。' +
        '细长的信子不断吐吐收收，感知着周围的气息。' +
        '蛇头呈三角形，这是毒蛇的特征。' +
        '南疆的毒蛇种类繁多，其中不少是巫医用来炼制蛊药的原料，' +
        '但在野外相遇，它们只会将你视为威胁。',
    );
    this.set('title', '');
    this.set('gender', 'neutral');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 7);
    this.set('max_hp', 120);
    this.set('hp', 120);
    this.set('combat_exp', 35);
    this.set('personality', 'grumpy');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 3);
    this.set('chat_msg', [
      '毒蛇竖起脖颈，吐着信子，发出细微的嘶嘶声。',
      '毒蛇在草丛中游动，只露出一截菱形花纹的身体。',
      '毒蛇盘踞在阴凉处，对靠近的人影保持着警惕的注视。',
    ]);
    this.set('inquiry', {
      default: '毒蛇昂首吐信，发出低沉的嘶嘶警告声。',
    });
  }
}
