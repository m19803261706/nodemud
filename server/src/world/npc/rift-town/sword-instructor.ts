/**
 * 剑术教习 — 裂隙镇练武场
 * 专教基础剑法的年轻教习
 */
import { Factions } from '@packages/core';
import { NpcBase } from '../../../engine/game-objects/npc-base';
import type { PlayerBase } from '../../../engine/game-objects/player-base';
import { NOVICE_SKILL_IDS } from '../../../engine/skills/novice/novice-skill-ids';

export default class SwordInstructor extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '剑术教习');
    this.set('short', '一位面容清瘦的年轻教习');
    this.set(
      'long',
      '剑术教习二十来岁，眉目清俊，腰间一柄长剑擦得极亮。' +
        '他说话不多，示范招式时手腕却极稳，一看便知基本功扎实。',
    );
    this.set('title', '裂隙镇 练武场教习');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '裂隙镇');
    this.set('attitude', 'friendly');
    this.set('level', 22);
    this.set('max_hp', 1200);
    this.set('hp', 1200);
    this.set('combat_exp', 1600);

    this.set('can_public_teach', true);
    this.set('teach_cost', 14);
    this.set('teach_skills', [NOVICE_SKILL_IDS.BASIC_SWORD]);
    this.set('teach_skill_levels', {
      [NOVICE_SKILL_IDS.BASIC_SWORD]: 90,
    });

    this.set('personality', 'friendly');
    this.set('speech_style', 'formal');
    this.set('chat_chance', 12);
    this.set('chat_msg', [
      '剑术教习握剑比了个起手式，口中默念口诀。',
      '剑术教习对着木人桩缓缓刺出一剑，收剑时纹丝不动。',
      '剑术教习朝新来的弟子点了点头，示意他先看。',
      '剑术教习将长剑横于膝上，用一块细布仔细擦拭剑身。',
    ]);

    this.set('inquiry', {
      学艺: (asker) => {
        const title = this.getPlayerTitle(asker as PlayerBase);
        return `剑术教习微微颔首：「${title}，剑走轻灵，第一课便是稳。想学的话，我从起手式教起。」`;
      },
      剑法: '剑术教习道：「剑不同刀，讲究的是准与快。一剑刺出，不偏不倚，方算入门。」',
      练武场: '剑术教习道：「练武场地方虽不大，但各路兵器都有人教，适合初学者打底子。」',
      default: (asker) => {
        const title = this.getPlayerTitle(asker as PlayerBase);
        return `剑术教习道：「${title}，这些我说不好，你去问陈教头或者温夫子吧。」`;
      },
    });
  }
}
