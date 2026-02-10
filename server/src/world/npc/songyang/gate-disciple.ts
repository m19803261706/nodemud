/**
 * 守山弟子 — 嵩阳宗山门值守
 * 门派职责：环境氛围与基础问询（本期无交互动作）
 */
import { Factions } from '@packages/core';
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { BaseEntity } from '../../../engine/base-entity';
import { PlayerBase } from '../../../engine/game-objects/player-base';

export default class SongyangGateDisciple extends NpcBase {
  static virtual = false;

  private static readonly ENTRY_KEYWORDS = new Set(['来意', '入山', '拜师', '求学', '求见']);

  create() {
    this.set('name', '守山弟子');
    this.set('short', '一名值守山门的年轻弟子');
    this.set(
      'long',
      '守山弟子背着长剑立在山门侧，眼神虽青涩却不散。你听得见他呼吸均匀，显然是按门中吐纳法在守值。',
    );
    this.set('title', '嵩阳宗');
    this.set('gender', 'male');
    this.set('faction', Factions.SONG_YANG);
    this.set('visible_faction', '嵩阳宗');
    this.set('attitude', 'neutral');
    this.set('level', 15);
    this.set('max_hp', 780);
    this.set('hp', 780);
    this.set('combat_exp', 900);

    this.set('sect_id', 'songyang');

    this.set('chat_chance', 14);
    this.set('chat_msg', [
      '守山弟子目视山道，低声复诵值守口令。',
      '守山弟子向你抱拳，道：「山门重地，请按规行事。」',
      '守山弟子抬手整了整剑穗，继续站定不动。',
    ]);

    this.set('inquiry', {
      门规: '守山弟子道：「入山先正衣冠，入门先正心念。」',
      去路: '守山弟子道：「北去山门，西去弟子院，规矩在先。」',
      来意: '守山弟子打量你片刻，道：「可。记住：山门内不得喧哗生事。」',
      入山: '守山弟子点头道：「入山可以，先守规矩。」',
      拜师: '守山弟子道：「要拜师先去弟子院找何教习，莫直接闯堂。」',
      default: '守山弟子道：「若要入山，先把来意说明白。」',
    });
  }

  onChat(speaker: BaseEntity, message: string): void {
    if (!(speaker instanceof PlayerBase)) return;

    const keyword = message.trim();
    if (!SongyangGateDisciple.ENTRY_KEYWORDS.has(keyword)) return;

    const sectData = speaker.get<any>('sect');
    const sectId = sectData?.current?.sectId;
    if (sectId === 'songyang') {
      speaker.receiveMessage('守山弟子抱拳道：「同门请入。」');
      return;
    }

    // 给外来者发放短时一次性通行许可，由山道房间 PRE_LEAVE 事件在进山时消耗。
    const passUntil = Date.now() + 3 * 60 * 1000;
    speaker.setTemp('sect/songyang_gate_pass_until', passUntil);
    speaker.receiveMessage('守山弟子侧身让出半步：「可入山门一次，办完事速退。」');
  }
}
