/**
 * 陈教头 — 裂隙镇武馆公共教习
 */
import { Factions, rt } from '@packages/core';
import { NpcBase } from '../../../engine/game-objects/npc-base';
import type { PlayerBase } from '../../../engine/game-objects/player-base';
import { NOVICE_SKILL_IDS } from '../../../engine/skills/novice/novice-skill-ids';
import {
  type QuestDefinition,
  QuestType,
  ObjectiveType,
} from '../../../engine/quest/quest-definition';

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
      NOVICE_SKILL_IDS.BASIC_SPEAR,
    ]);
    this.set('teach_skill_levels', {
      [NOVICE_SKILL_IDS.BASIC_BLADE]: 90,
      [NOVICE_SKILL_IDS.BASIC_DODGE]: 90,
      [NOVICE_SKILL_IDS.BASIC_PARRY]: 90,
      [NOVICE_SKILL_IDS.BASIC_SPEAR]: 90,
    });

    this.set('personality', 'stern');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 12);
    this.set('chat_msg', [
      '陈教头抬手一指地上的圈线：「脚先到，手才到。」',
      '陈教头沉声道：「江湖先学站稳，再学赢人。」',
      '陈教头用竹杆轻敲木人桩，示意弟子重走一遍步位。',
      '陈教头双手背后，绕着练功场慢慢踱步，目光扫过每一个弟子。',
    ]);

    this.set('inquiry', {
      学艺: (asker) => {
        const title = this.getPlayerTitle(asker as PlayerBase);
        return `陈教头道：「${title}，会看会听不算本事，站出来，我按你的底子给你定课。」`;
      },
      武馆: '陈教头道：「裂隙镇的年轻人，多半都在这儿打过底子。」',
      刀法: '陈教头道：「刀要走直，心不能飘。」',
      身法: '陈教头道：「躲不是逃，是换位再拿主动。」',
      default: (asker) => {
        const title = this.getPlayerTitle(asker as PlayerBase);
        return `陈教头道：「${title}，闲话少说，想学就上场。」`;
      },
    });

    // 新手任务 006：引导玩家学外功
    const questDefs: QuestDefinition[] = [
      {
        id: 'rift-town-novice-006',
        name: '武馆习武',
        description: '温夫子让你去武馆找陈教头学几手实在功夫。',
        type: QuestType.DIALOGUE,
        giverNpc: 'npc/rift-town/martial-instructor',
        prerequisites: { completedQuests: ['rift-town-novice-005'] },
        objectives: [
          {
            type: ObjectiveType.TALK,
            targetId: 'npc/rift-town/martial-instructor',
            count: 1,
            description: '前往武馆向陈教头请教武艺',
          },
        ],
        rewards: {
          exp: 200,
          silver: 25,
          potential: 35,
          score: 12,
          rewardSkills: [
            NOVICE_SKILL_IDS.BASIC_BLADE,
            NOVICE_SKILL_IDS.BASIC_DODGE,
            NOVICE_SKILL_IDS.BASIC_PARRY,
          ],
        },
        flavorText: {
          onAccept:
            `${rt('npc', '陈教头')}上下打量你一番，点了点头：` +
            '「温夫子让你来的？底子不差。」\n' +
            `${rt('emote', '陈教头抛给你一把练习木刀，亲自示范了挑帘起手、移步闪避和举架招架三个基本动作，反复纠正你的姿势直到他满意为止。')}`,
          onComplete:
            `${rt('npc', '陈教头')}收起竹杆，难得露出一丝笑意：` +
            '「架子像样了。有内息打底，招式才能活起来。」\n' +
            `他背过手去，语气又恢复了惯常的严厉：「去找广场上的${rt('npc', '老镇长')}吧，他一直念叨北道不太平，正好让你练练手。」`,
        },
      },
    ];
    this.set('quests', questDefs);
  }
}
