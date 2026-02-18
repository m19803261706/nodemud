/**
 * 神秘旅人 — 裂隙镇断崖酒馆
 * 暗河组织成员，隐藏身份在镇上观察情报
 * 多条闲聊暗示情报身份，ask 词条涉及暗河/酒馆/北方等敏感话题，
 * 对陌生人保持高度警觉
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';
import type { LivingBase } from '../../../engine/game-objects/living-base';
import type { ItemBase } from '../../../engine/game-objects/item-base';
import type { PlayerBase } from '../../../engine/game-objects/player-base';
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class MysteriousTraveler extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '神秘旅人');
    this.set('short', '一个黑衣蒙面的旅人');
    this.set(
      'long',
      '角落里坐着一个黑衣旅人，用一块深色面巾遮住了大半张脸，' +
        '只露出一双深邃而锐利的眼睛。他面前的酒杯几乎没怎么动过，' +
        '似乎来这里并不是为了喝酒。偶尔有人靠近，他便微微侧过身去，' +
        '浑身散发着一股拒人千里之外的气息。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('personality', 'stern');
    this.set('speech_style', 'formal');
    this.set('faction', Factions.AN_HE);
    this.set('visible_faction', ''); // 暗河身份隐藏
    this.set('attitude', 'neutral');
    this.set('level', 30);
    this.set('max_hp', 1500);
    this.set('hp', 1500);
    this.set('chat_chance', 8);
    this.set('chat_msg', [
      '神秘旅人低头抿了一口酒，若有所思。',
      '神秘旅人的目光从窗口扫过，又收了回来。',
      '神秘旅人微微调整了一下坐姿，手始终没离开腰间。',
      '[emote]神秘旅人的目光不动声色地扫过酒馆每个角落，像在清点人数。[/emote]',
      '[emote]神秘旅人整理衣襟时，内衬里隐约露出几枚暗器的轮廓，他若无其事地拢好衣领。[/emote]',
    ]);
    this.set('inquiry', {
      来历: '神秘旅人冷冷地看了你一眼：「与你无关。」',
      裂谷: '神秘旅人沉默片刻，低声说：「裂谷深处……有些东西，最好不要去碰。」',
      暗河: '神秘旅人握杯的手指骤然收紧，锐利的目光刺来：「你说什么？」沉默了三息，才缓缓道：「不知道你在说什么。」语气已恢复平静，但指节仍微微发白。',
      酒馆: '神秘旅人淡淡道：「掌柜是个聪明人，知道什么该问什么不该问。」[emote]他说这话时，目光不自觉地扫向柜台后的酒保。[/emote]',
      掌柜: '神秘旅人淡淡道：「掌柜是个聪明人，知道什么该问什么不该问。」[emote]他说这话时，目光不自觉地扫向柜台后的酒保。[/emote]',
      北方: '神秘旅人垂下眼帘：「北边……最近不太平。」说完顿了一下，似乎意识到说多了：「你问这个做什么？」',
      边境: '神秘旅人垂下眼帘：「北边……最近不太平。」说完顿了一下，似乎意识到说多了：「你问这个做什么？」',
      default: '神秘旅人没有理会你，继续盯着手中的酒杯出神。',
    });
    this.set('combat_exp', 150);
    this.set('equipment', [
      { blueprintId: 'item/rift-town/dark-robe', position: 'body' },
      { blueprintId: 'item/rift-town/dark-gloves', position: 'hands' },
      { blueprintId: 'item/rift-town/dark-spike', position: 'weapon' },
    ]);
  }

  /**
   * 接收物品钩子 — 先审视意图，再根据物品类型反应
   */
  onReceiveItem(_giver: LivingBase, item: ItemBase): { accept: boolean; message?: string } {
    const itemName = item.getName();

    // 一律拒收，但给出带性格的拒绝反应
    return {
      accept: false,
      message: `神秘旅人冰冷的目光扫过[item]${itemName}[/item]，又落在你脸上：「你想干什么？」他没有接，手不动声色地搭回腰间。`,
    };
  }

  /**
   * 玩家进入房间：~10% 概率警觉观察
   */
  onPlayerEnter(player: PlayerBase): void {
    if (Math.random() > 0.1) return;

    const env = this.getEnvironment();
    if (!env || !(env instanceof RoomBase)) return;

    const lines = [
      '[emote]角落里的黑衣旅人不着痕迹地将手移向腰间。[/emote]',
      '[emote]黑衣旅人的目光在你身上停了一息，随即移开，面巾下看不出表情。[/emote]',
      '[emote]你推门进来的瞬间，角落里似乎有道视线掠过你的脸，但等你看过去时，那人正低头喝酒。[/emote]',
    ];
    const msg = lines[Math.floor(Math.random() * lines.length)];
    player.receiveMessage(msg);
  }
}
