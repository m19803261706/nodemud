/**
 * 老乞丐 — 裂隙镇南街
 * 看似落魄的乞丐，实则隐藏着高手身份
 * 多条闲聊暗示其真实实力，ask 词条随玩家等级变化，
 * 赠物按物品类型给出不同反应
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';
import type { LivingBase } from '../../../engine/game-objects/living-base';
import type { ItemBase } from '../../../engine/game-objects/item-base';
import type { PlayerBase } from '../../../engine/game-objects/player-base';
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class OldBeggar extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '老乞丐');
    this.set('short', '一个蓬头垢面的老乞丐');
    this.set(
      'long',
      '南街墙角蹲着一个蓬头垢面的老乞丐，身上裹着一件破烂不堪的麻衣，' +
        '面前放着一个缺了口的破碗。他看起来瘦骨嶙峋、老态龙钟，' +
        '但偶尔抬起头时，那双浑浊的眼睛里似乎闪过一丝不同寻常的光芒。' +
        '镇上的人说他在这儿待了十几年了，没人知道他从哪来。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('personality', 'cunning');
    this.set('speech_style', 'crude');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'neutral');
    this.set('level', 10);
    this.set('max_hp', 300);
    this.set('hp', 300);
    this.set('chat_chance', 10);
    this.set('chat_msg', [
      '老乞丐缩了缩身子，裹紧了破烂的麻衣。',
      '老乞丐咕哝着什么，听不太清楚。',
      '老乞丐呆呆地望着天空，嘴里含混地哼着不知名的调子。',
      '[emote]老乞丐随手一划，指尖掠过的枯叶被无形气劲卷起半寸，但他浑然不觉，兀自挠了挠后脑勺。[/emote]',
      '[emote]老乞丐忽然念叨了一句「气沉丹田、意守百会」，又立刻改口：「嘿嘿，说梦话呢。」[/emote]',
    ]);
    this.set('inquiry', {
      来历: '老乞丐嘿嘿笑了两声：「老叫花子嘛，哪来的不重要，有口饭吃就行。行行好，赏个铜板呗？」',
      身份: '老乞丐搓了搓脏兮兮的手：「什么来历不来历的，就一讨饭的老头子。」说着打了个哈欠，袖口里隐约露出几道陈年旧疤。',
      裂谷: '老乞丐突然抬起头，眼神变得清明了一瞬：「裂谷……嘿嘿，那下面的东西，可不是你们能碰的。」随即又恢复了浑浑噩噩的模样。',
      武功: (asker: LivingBase) => {
        const level = asker.get<number>('level') || 1;
        if (level > 20) {
          return '老乞丐的目光骤然锐利了一瞬，旋即恢复浑浊：「你倒有几分眼力……算了，不说了。」手指不自觉比划出半个剑招，随即缩回袖中。';
        }
        return '老乞丐哈哈大笑：「老叫花子哪懂什么武功……」[emote]他的手指不自觉比划出半个剑招，又讪讪地缩了回去。[/emote]';
      },
      功夫: (asker: LivingBase) => {
        const level = asker.get<number>('level') || 1;
        if (level > 20) {
          return '老乞丐的目光骤然锐利了一瞬，旋即恢复浑浊：「你倒有几分眼力……算了，不说了。」手指不自觉比划出半个剑招，随即缩回袖中。';
        }
        return '老乞丐哈哈大笑：「老叫花子哪懂什么武功……」[emote]他的手指不自觉比划出半个剑招，又讪讪地缩了回去。[/emote]';
      },
      default: '老乞丐迷迷糊糊地摇了摇头：「嗯？啥？行行好赏口饭吃……」',
    });
    this.set('equipment', [{ blueprintId: 'item/rift-town/torn-rags', position: 'body' }]);

    // 漫游：老乞丐在裂隙镇公共区域闲逛
    this.set('wander', {
      chance: 5, // 每心跳 5% 概率（平均 ~40s 移动一次）
      rooms: [
        'area/rift-town/south-street',
        'area/rift-town/square',
        'area/rift-town/north-street',
        'area/rift-town/tavern',
        'area/rift-town/south-gate',
      ],
    });
  }

  /**
   * 接收物品钩子 — 根据物品类型给出不同反应，暗示隐藏身份
   */
  onReceiveItem(_giver: LivingBase, item: ItemBase): { accept: boolean; message?: string } {
    const itemType = item.get<string>('type') || '';
    const itemName = item.getName();

    // 食物：感激但有尊严
    if (itemType === 'food') {
      return {
        accept: true,
        message: `老乞丐接过[item]${itemName}[/item]，点了点头：「多谢了。」[emote]接过食物的手稳如磐石，不像是常年乞讨的人。[/emote]`,
      };
    }

    // 药品：勉强收下
    if (itemType === 'medicine') {
      return {
        accept: true,
        message: `老乞丐收了[item]${itemName}[/item]，嘀咕道：「药？老叫花身子骨硬朗得很。」[emote]他把药收进怀里的动作干净利落，全无老态。[/emote]`,
      };
    }

    // 武器：短暂沉默，拒绝
    if (itemType === 'weapon') {
      return {
        accept: false,
        message: `老乞丐盯着[item]${itemName}[/item]，忽然沉默了。[emote]他眼中一闪而过的锐利很快消散。[/emote]「这东西……你自己留着用吧。」`,
      };
    }

    // 其他物品：困惑
    return {
      accept: false,
      message: `老乞丐茫然地看了看[item]${itemName}[/item]：「给老叫花这个做什么？」`,
    };
  }

  /**
   * 玩家进入房间：~15% 概率打量玩家
   */
  onPlayerEnter(player: PlayerBase): void {
    if (Math.random() > 0.15) return;

    const env = this.getEnvironment();
    if (!env || !(env instanceof RoomBase)) return;

    const lines = [
      '[emote]老乞丐的目光扫过你的脚步，嘴角微微一动。[/emote]',
      '[emote]老乞丐抬了抬眼皮，浑浊的目光在你腰间的兵刃上停了一瞬。[/emote]',
      '[emote]老乞丐忽然抽了抽鼻子，像是在辨别什么气息，随即又低下头去。[/emote]',
    ];
    const msg = lines[Math.floor(Math.random() * lines.length)];
    player.receiveMessage(msg);
  }
}
