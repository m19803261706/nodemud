/**
 * 温夫子 — 裂隙镇书院公共讲郎
 */
import { Factions } from '@packages/core';
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { NOVICE_SKILL_IDS } from '../../../engine/skills/novice/novice-skill-ids';

export default class AcademyLecturer extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '温夫子');
    this.set('short', '一位衣衫整洁的书院讲郎');
    this.set(
      'long',
      '温夫子持卷而立，声线不高却很稳。他讲吐纳时常说“气不在猛，在长”，许多行脚武人也会来此借他一句点拨。',
    );
    this.set('title', '裂隙镇 书院讲郎');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '裂隙镇');
    this.set('attitude', 'friendly');
    this.set('level', 24);
    this.set('max_hp', 1100);
    this.set('hp', 1100);
    this.set('combat_exp', 1800);

    this.set('can_public_teach', true);
    this.set('teach_cost', 14);
    this.set('teach_skills', [NOVICE_SKILL_IDS.BASIC_FORCE]);
    this.set('teach_skill_levels', {
      [NOVICE_SKILL_IDS.BASIC_FORCE]: 90,
    });

    this.set('chat_chance', 12);
    this.set('chat_msg', [
      '温夫子合上书卷，缓声道：「急气最伤脉，缓气方能久。」',
      '温夫子示意弟子放慢呼吸：「先匀，再深，最后才谈运劲。」',
      '温夫子提笔记下几句口诀，递给一旁的新学徒。',
    ]);

    this.set('inquiry', {
      学艺: '温夫子道：「吐纳不是玄谈，日日按时做，三月自见根基。」',
      书院: '温夫子道：「书院不只教字，也教人把心静下来。」',
      吐纳: '温夫子道：「先会呼，后会吸；先会守，后会发。」',
      default: '温夫子道：「你若有心学，我便有心教。」',
    });
  }
}
