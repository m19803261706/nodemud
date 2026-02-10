/**
 * 何教习 — 嵩阳宗入门教习
 * 门派职责：初阶收徒
 */
import { Factions } from '@packages/core';
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { SONGYANG_SKILL_IDS } from '../../../engine/skills/songyang/songyang-skill-ids';

export default class SongyangMentorHe extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '何教习');
    this.set('short', '一位神情严整的中年教习');
    this.set(
      'long',
      '何教习衣袖挽到腕骨，手里常握竹片记录弟子步法。门中新弟子先过他这一关，方可算真正跨入嵩阳门槛。',
    );
    this.set('title', '嵩阳宗 入门教习');
    this.set('gender', 'male');
    this.set('faction', Factions.SONG_YANG);
    this.set('visible_faction', '嵩阳宗');
    this.set('attitude', 'neutral');
    this.set('level', 28);
    this.set('max_hp', 1800);
    this.set('hp', 1800);
    this.set('combat_exp', 2600);

    this.set('sect_id', 'songyang');
    this.set('sect_role', 'mentor');
    this.set('teach_cost', 20);
    this.set('teach_skills', [
      SONGYANG_SKILL_IDS.ENTRY_BLADE,
      SONGYANG_SKILL_IDS.ENTRY_DODGE,
      SONGYANG_SKILL_IDS.ENTRY_PARRY,
      SONGYANG_SKILL_IDS.ENTRY_FORCE,
    ]);

    this.set('chat_chance', 12);
    this.set('chat_msg', [
      '何教习沉声道：「脚下先稳，拳上才有魂。」',
      '何教习用竹片在地上轻点两下，示意弟子重走步位。',
      '何教习翻看名册，逐个核对新弟子课业。',
    ]);

    this.set('inquiry', {
      拜师: '何教习道：「入我门墙，先守门规。你若想清楚了，便可开口拜师。」',
      门规: '何教习道：「欺师灭祖、残害同门，皆是重罪。」',
      学艺: '何教习道：「先把入门四课练扎实：刀、步、架、吐纳，一样都不能省。」',
      来意: '何教习道：「要学本事，先把心摆正。」',
      default: '何教习道：「说重点，江湖不听废话。」',
    });
  }
}
