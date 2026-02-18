/**
 * 温夫子 — 裂隙镇书院公共讲郎
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
    this.set('teach_skills', [NOVICE_SKILL_IDS.BASIC_FORCE, NOVICE_SKILL_IDS.BASIC_STAFF]);
    this.set('teach_skill_levels', {
      [NOVICE_SKILL_IDS.BASIC_FORCE]: 90,
      [NOVICE_SKILL_IDS.BASIC_STAFF]: 90,
    });

    this.set('personality', 'friendly');
    this.set('speech_style', 'scholarly');
    this.set('chat_chance', 12);
    this.set('chat_msg', [
      '温夫子合上书卷，缓声道：「急气最伤脉，缓气方能久。」',
      '温夫子示意弟子放慢呼吸：「先匀，再深，最后才谈运劲。」',
      '温夫子提笔记下几句口诀，递给一旁的新学徒。',
      '温夫子翻开一卷泛黄的经文，逐字默读，不时轻轻点头。',
    ]);

    this.set('inquiry', {
      学艺: (asker) => {
        const title = this.getPlayerTitle(asker as PlayerBase);
        return `温夫子道：「${title}，吐纳不是玄谈，日日按时做，三月自见根基。」`;
      },
      书院: '温夫子道：「书院不只教字，也教人把心静下来。」',
      吐纳: '温夫子道：「先会呼，后会吸；先会守，后会发。」',
      default: (asker) => {
        const title = this.getPlayerTitle(asker as PlayerBase);
        return `温夫子道：「${title}若有心学，我便有心教。」`;
      },
    });

    // 新手任务 005：引导玩家学内功
    const questDefs: QuestDefinition[] = [
      {
        id: 'rift-town-novice-005',
        name: '书院问气',
        description: '酒保提过，书院温夫子教人吐纳，或许该去请教一番。',
        type: QuestType.DIALOGUE,
        giverNpc: 'npc/rift-town/academy-lecturer',
        prerequisites: { completedQuests: ['rift-town-novice-003'] },
        objectives: [
          {
            type: ObjectiveType.TALK,
            targetId: 'npc/rift-town/academy-lecturer',
            count: 1,
            description: '前往书院向温夫子请教吐纳之术',
          },
        ],
        rewards: {
          exp: 180,
          silver: 20,
          potential: 30,
          score: 10,
          rewardSkills: [NOVICE_SKILL_IDS.BASIC_FORCE],
        },
        flavorText: {
          onAccept:
            `${rt('npc', '温夫子')}放下手中书卷，目光温和：` +
            '「行走江湖，不能只靠拳脚。气息不通，招式再快也是空架子。来，先跟我调息。」\n' +
            `${rt('emote', '温夫子引你盘膝而坐，从最基本的呼吸开始，一呼一吸间，你隐约感到丹田处微微发暖。')}`,
          onComplete:
            `${rt('npc', '温夫子')}颔首微笑：「气已入脉，虽浅犹真。日后勤练，自有长进。」\n` +
            `他顿了顿，又道：「光有内息不够，还得会用。去武馆找${rt('npc', '陈教头')}，让他教你几手实在的功夫。」`,
        },
      },
    ];
    this.set('quests', questDefs);
  }
}
