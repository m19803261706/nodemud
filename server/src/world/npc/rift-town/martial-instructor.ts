/**
 * 陈教头 — 裂隙镇武馆公共教习
 */
import { Factions } from '@packages/core';
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { NOVICE_SKILL_IDS } from '../../../engine/skills/novice/novice-skill-ids';

export default class MartialInstructor extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '陈教头');
    this.set('short', '一位臂膀结实的武馆教头');
    this.set(
      'long',
      '陈教头说话不多，手里总握着一根竹杆。谁步法浮了、架子散了，他只用竹杆一点，弟子立刻明白该怎么改。',
    );
    this.set('title', '裂隙镇 武馆教头');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '裂隙镇');
    this.set('attitude', 'friendly');
    this.set('level', 26);
    this.set('max_hp', 1600);
    this.set('hp', 1600);
    this.set('combat_exp', 2200);

    this.set('can_public_teach', true);
    this.set('teach_cost', 16);
    this.set('teach_skills', [
      NOVICE_SKILL_IDS.BASIC_BLADE,
      NOVICE_SKILL_IDS.BASIC_DODGE,
      NOVICE_SKILL_IDS.BASIC_PARRY,
    ]);
    this.set('teach_skill_levels', {
      [NOVICE_SKILL_IDS.BASIC_BLADE]: 90,
      [NOVICE_SKILL_IDS.BASIC_DODGE]: 90,
      [NOVICE_SKILL_IDS.BASIC_PARRY]: 90,
    });

    this.set('chat_chance', 12);
    this.set('chat_msg', [
      '陈教头抬手一指地上的圈线：「脚先到，手才到。」',
      '陈教头沉声道：「江湖先学站稳，再学赢人。」',
      '陈教头用竹杆轻敲木人桩，示意弟子重走一遍步位。',
    ]);

    this.set('inquiry', {
      学艺: '陈教头道：「会看会听不算本事，站出来，我按你的底子给你定课。」',
      武馆: '陈教头道：「裂隙镇的年轻人，多半都在这儿打过底子。」',
      刀法: '陈教头道：「刀要走直，心不能飘。」',
      身法: '陈教头道：「躲不是逃，是换位再拿主动。」',
      default: '陈教头道：「闲话少说，想学就上场。」',
    });
  }
}
