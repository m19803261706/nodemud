/**
 * 拳脚教习 — 裂隙镇练武场
 * 专教基础拳法和掌法的壮实教习
 */
import { Factions } from '@packages/core';
import { NpcBase } from '../../../engine/game-objects/npc-base';
import type { PlayerBase } from '../../../engine/game-objects/player-base';
import { NOVICE_SKILL_IDS } from '../../../engine/skills/novice/novice-skill-ids';

export default class FistInstructor extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '拳脚教习');
    this.set('short', '一位膀大腰圆的壮实教习');
    this.set(
      'long',
      '拳脚教习三十出头，虎背熊腰，一双拳头布满老茧。' +
        '他嗓门大，笑起来声如洪钟，教拳时却极有耐心，一个动作能纠正十遍。',
    );
    this.set('title', '裂隙镇 练武场教习');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '裂隙镇');
    this.set('attitude', 'friendly');
    this.set('level', 23);
    this.set('max_hp', 1400);
    this.set('hp', 1400);
    this.set('combat_exp', 1800);

    this.set('can_public_teach', true);
    this.set('teach_cost', 14);
    this.set('teach_skills', [NOVICE_SKILL_IDS.BASIC_FIST, NOVICE_SKILL_IDS.BASIC_PALM]);
    this.set('teach_skill_levels', {
      [NOVICE_SKILL_IDS.BASIC_FIST]: 90,
      [NOVICE_SKILL_IDS.BASIC_PALM]: 90,
    });

    this.set('personality', 'friendly');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 12);
    this.set('chat_msg', [
      '拳脚教习抡起拳头在空中虚晃两招，拳风带响。',
      '拳脚教习拍了拍沙袋，示意弟子上前练。',
      '拳脚教习哈哈一笑：「拳头就是最趁手的兵器！」',
      '拳脚教习蹲着马步，一动不动，像扎了根似的。',
    ]);

    this.set('inquiry', {
      学艺: (asker) => {
        const title = this.getPlayerTitle(asker as PlayerBase);
        return `拳脚教习咧嘴一笑：「${title}，想学拳还是掌？拳走猛，掌走巧，各有各的好。」`;
      },
      拳法: '拳脚教习道：「拳头要快，劲道要沉。打出去收回来，都是一个字——稳。」',
      掌法: '拳脚教习道：「掌法不一样，讲的是柔中带刚。看着绵软，打上去可不轻。」',
      default: (asker) => {
        const title = this.getPlayerTitle(asker as PlayerBase);
        return `拳脚教习挠挠头：「${title}，这事儿你得问别人，我只懂拳脚。」`;
      },
    });
  }
}
