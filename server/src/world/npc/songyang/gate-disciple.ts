/**
 * 守山弟子 -- 嵩阳宗山门值守
 * 门派职责：环境氛围与基础问询（本期无交互动作）
 * 性格：严厉 (stern) / 说话风格：正式 (formal)
 */
import { Factions } from '@packages/core';
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { BaseEntity } from '../../../engine/base-entity';
import { PlayerBase } from '../../../engine/game-objects/player-base';
import { RoomBase } from '../../../engine/game-objects/room-base';

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

    // 性格标签
    this.set('personality', 'stern');
    this.set('speech_style', 'formal');

    this.set('sect_id', 'songyang');

    this.set('chat_chance', 14);
    this.set('chat_msg', [
      '守山弟子目视山道，低声复诵值守口令。',
      '守山弟子向你抱拳，道：「山门重地，请按规行事。」',
      '守山弟子抬手整了整剑穗，继续站定不动。',
      '守山弟子偷偷打了个哈欠，又赶紧挺直了腰板。',
      '守山弟子望着山道尽头，嘟囔：「今日怎么一个上山的人都没有……」',
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

  /**
   * 对话钩子：处理入山关键词
   * 同门直接放行，外来者发放临时通行许可
   */
  onChat(speaker: BaseEntity, message: string): void {
    if (!(speaker instanceof PlayerBase)) return;

    const keyword = message.trim();
    if (!SongyangGateDisciple.ENTRY_KEYWORDS.has(keyword)) return;

    const title = this.getPlayerTitle(speaker);
    if (this.isPlayerSameSect(speaker)) {
      speaker.receiveMessage(`守山弟子抱拳道：「${title}请入，自家人不必多礼。」`);
      return;
    }

    // 给外来者发放短时一次性通行许可，由山道房间 PRE_LEAVE 事件在进山时消耗
    const passUntil = Date.now() + 3 * 60 * 1000;
    speaker.setTemp('sect/songyang_gate_pass_until', passUntil);
    speaker.receiveMessage(`守山弟子侧身让出半步：「${title}可入山门一次，办完事速退。」`);
  }

  /**
   * 玩家进入山门：外来者高概率盘问（~50%）
   */
  onPlayerEnter(player: PlayerBase): void {
    // 同门不盘问
    if (this.isPlayerSameSect(player)) return;
    if (Math.random() > 0.5) return;

    const title = this.getPlayerTitle(player);
    const env = this.getEnvironment();
    if (!env || !(env instanceof RoomBase)) return;

    const lines = [
      `守山弟子警觉地拦住去路：「${title}且慢，此乃嵩阳重地，先报来意。」`,
      `守山弟子上前一步，按住剑柄：「${title}是何人？来此何事？」`,
      `守山弟子目光审视：「山门不是闲人出入之地，${title}请说明来意。」`,
    ];
    const msg = lines[Math.floor(Math.random() * lines.length)];
    player.receiveMessage(msg);
  }
}
