/**
 * 许长老 -- 嵩阳宗传功长老
 * 门派职责：收徒 / 见证叛门
 * 性格：友善 (friendly) / 说话风格：书卷气 (scholarly)
 */
import { Factions } from '@packages/core';
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { SONGYANG_SKILL_IDS } from '../../../engine/skills/songyang/songyang-skill-ids';

export default class SongyangElderXu extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '许长老');
    this.set('short', '一位神色平和的灰袍长老');
    this.set(
      'long',
      '许长老背脊笔直，鬓角已霜，目光却温而不软。门中弟子常说，掌门看门风，许长老看心性，能入他眼者不多。',
    );
    this.set('title', '嵩阳宗 传功长老');
    this.set('gender', 'male');
    this.set('faction', Factions.SONG_YANG);
    this.set('visible_faction', '嵩阳宗');
    this.set('attitude', 'friendly');
    this.set('level', 40);
    this.set('max_hp', 2900);
    this.set('hp', 2900);
    this.set('combat_exp', 5200);

    // 性格标签
    this.set('personality', 'friendly');
    this.set('speech_style', 'scholarly');

    this.set('sect_id', 'songyang');
    this.set('sect_role', 'master');
    this.set('teach_cost', 60);
    this.set('teach_skills', [
      SONGYANG_SKILL_IDS.ADVANCED_BLADE,
      SONGYANG_SKILL_IDS.ADVANCED_DODGE,
      SONGYANG_SKILL_IDS.ADVANCED_PARRY,
      SONGYANG_SKILL_IDS.ADVANCED_FORCE,
    ]);
    this.set('teach_skill_levels', {
      [SONGYANG_SKILL_IDS.ADVANCED_BLADE]: 120,
      [SONGYANG_SKILL_IDS.ADVANCED_DODGE]: 120,
      [SONGYANG_SKILL_IDS.ADVANCED_PARRY]: 120,
      [SONGYANG_SKILL_IDS.ADVANCED_FORCE]: 120,
    });

    this.set('chat_chance', 9);
    this.set('chat_msg', [
      '许长老合掌静立，低声道：「招式可教，心术难扶。」',
      '许长老看着山雾，道：「练武先练耐性，耐性就是命门。」',
      '许长老把一本旧谱放回架上，神色安然。',
      '许长老翻着一卷泛黄的手札，偶尔提笔在页边批注几个小字。',
      '许长老负手立于窗前，望着院中弟子练功，微微颔首。',
    ]);

    this.set('inquiry', {
      拜师: '许长老道：「新入门者，先去弟子院见何教习。」',
      门规: '许长老道：「守正、守信、守锋，三守缺一不可。」',
      学艺: '许长老道：「进阶功课最忌急躁。先达职位，再补心性，方可承得住更重的招法。」',
      default: '许长老道：「你若不急，江湖自会给你路。」',
    });
  }
}
