/**
 * 何教习 -- 嵩阳宗入门教习
 * 门派职责：初阶收徒
 * 性格：严厉 (stern) / 说话风格：正式 (formal)
 */
import { Factions } from '@packages/core';
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { SONGYANG_SKILL_IDS } from '../../../engine/skills/songyang/songyang-skill-ids';
import type { PlayerBase } from '../../../engine/game-objects/player-base';
import { RoomBase } from '../../../engine/game-objects/room-base';

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

    // 性格标签
    this.set('personality', 'stern');
    this.set('speech_style', 'formal');

    this.set('sect_id', 'songyang');
    this.set('sect_role', 'mentor');
    this.set('teach_cost', 20);
    this.set('teach_skills', [
      SONGYANG_SKILL_IDS.ENTRY_BLADE,
      SONGYANG_SKILL_IDS.ENTRY_DODGE,
      SONGYANG_SKILL_IDS.ENTRY_PARRY,
      SONGYANG_SKILL_IDS.ENTRY_FORCE,
    ]);
    this.set('teach_skill_levels', {
      [SONGYANG_SKILL_IDS.ENTRY_BLADE]: 60,
      [SONGYANG_SKILL_IDS.ENTRY_DODGE]: 60,
      [SONGYANG_SKILL_IDS.ENTRY_PARRY]: 60,
      [SONGYANG_SKILL_IDS.ENTRY_FORCE]: 60,
    });

    this.set('chat_chance', 12);
    this.set('chat_msg', [
      '何教习沉声道：「脚下先稳，拳上才有魂。」',
      '何教习用竹片在地上轻点两下，示意弟子重走步位。',
      '何教习翻看名册，逐个核对新弟子课业。',
      '何教习背手踱步，忽然喝道：「第三排！站桩膝盖过脚尖了！」',
      '何教习低头在竹片上记了几笔，嘴角微沉，似乎对今日课业不甚满意。',
    ]);

    this.set('inquiry', {
      拜师: '何教习道：「入我门墙，先守门规。你若想清楚了，便可开口拜师。」',
      门规: '何教习道：「欺师灭祖、残害同门，皆是重罪。」',
      学艺: '何教习道：「先把入门四课练扎实：刀、步、架、吐纳，一样都不能省。」',
      来意: '何教习道：「要学本事，先把心摆正。」',
      default: '何教习道：「说重点，江湖不听废话。」',
    });
  }

  /**
   * 玩家进入房间：偶尔点评同门弟子（~15%）
   */
  onPlayerEnter(player: PlayerBase): void {
    if (!this.isPlayerSameSect(player)) return;
    if (Math.random() > 0.15) return;

    const title = this.getPlayerTitle(player);
    const env = this.getEnvironment();
    if (!env || !(env instanceof RoomBase)) return;

    const lines = [
      `何教习扫了${title}一眼，道：「站没站相，去把桩法走三遍再来。」`,
      `何教习看见${title}，微微点头：「今天练了几趟刀？」`,
      `何教习竹片一点，沉声道：「${title}，步法有进步，但上盘还散。」`,
    ];
    const msg = lines[Math.floor(Math.random() * lines.length)];
    player.receiveMessage(msg);
  }
}
