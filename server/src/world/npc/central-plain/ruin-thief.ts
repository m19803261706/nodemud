/**
 * 废墟盗贼 — 洛阳废都·旧贵人坊
 * 在废宅间翻找财物的盗贼，警惕性高，对陌生人怀有敌意
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class RuinThief extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '废墟盗贼');
    this.set('short', '一个鬼鬼祟祟的人影');
    this.set(
      'long',
      '一个裹着暗色破布衫的人，腰间插着一把短匕首，' +
        '动作轻巧，习惯性地贴着墙角行走，像是天生怕见光。' +
        '看不清年纪，也看不出出身，乱世里这样的人多的是——' +
        '什么都干不了，但翻废墟找值钱东西这件事，手比眼快。',
    );
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 8);
    this.set('max_hp', 280);
    this.set('hp', 280);
    this.set('combat_exp', 65);
    this.set('chat_chance', 8);
    this.set('chat_msg', [
      '废墟盗贼蹲在墙角，快速翻检着一堆瓦砾，手指灵活地拨开碎砖，像在摸底牌。',
      '废墟盗贼听到动静，身子一僵，手慢慢摸向腰间的匕首，眼神戒备地扫向四周。',
    ]);
  }
}
