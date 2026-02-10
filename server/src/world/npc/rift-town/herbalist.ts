/**
 * 白发药师 — 裂隙镇药铺
 * 百蛮退隐高手，隐居裂隙镇开药铺
 * 作为 rift-town-001 任务的交付 NPC，接受任务物品
 */
import { Factions } from '@packages/core';
import { MerchantBase } from '../../../engine/game-objects/merchant-base';
import type { LivingBase } from '../../../engine/game-objects/living-base';
import type { ItemBase } from '../../../engine/game-objects/item-base';

export default class Herbalist extends MerchantBase {
  static virtual = false;

  create() {
    this.set('name', '白发药师');
    this.set('short', '一位白发如银的老妇人');
    this.set(
      'long',
      '药铺柜台后坐着一位白发如银的老妇人，面容清癯却气质出尘。' +
        '她的手指修长而稳定，正不紧不慢地碾磨着草药。' +
        '药铺里弥漫着各种草药的清苦香气。' +
        '据说她年轻时走遍了西南百蛮的深山老林，识得天下奇草异药，' +
        '不知何故隐居在这裂隙小镇上。',
    );
    this.set('title', '裂隙镇');
    this.set('gender', 'female');
    this.set('faction', Factions.BAI_MAN);
    this.set('visible_faction', '百蛮');
    this.set('attitude', 'neutral');
    this.set('level', 35);
    this.set('max_hp', 2000);
    this.set('hp', 2000);
    this.set('chat_chance', 8);
    this.set('chat_msg', [
      '白发药师低头碾磨着草药，药臼发出有节奏的声响。',
      '白发药师轻嗅了一下手中的草药，微微点头。',
      '白发药师翻开一本泛黄的药典，陷入了沉思。',
    ]);
    this.set('inquiry', {
      草药: '白发药师抬起头，淡淡地说：「裂谷里的草药倒是不少。崖壁上的石莲、谷底的灵芝……不过那些地方可不好去，没本事的人还是别冒险了。」',
      百蛮: '白发药师的手顿了顿：「西南百蛮……那是很久以前的事了。老身如今只是个卖药的。」',
      治伤: '白发药师打量了你一眼：「要治伤？小伤的话，买些止血散就够了。重伤嘛……看你诚意如何。」',
      default: '白发药师头也不抬：「没有的事，别打扰老身做药。」',
    });
    this.set('equipment', [
      { blueprintId: 'item/rift-town/herb-shirt', position: 'body' },
      { blueprintId: 'item/rift-town/herb-bracelet', position: 'wrist' },
    ]);
    this.set('shop_goods', [
      {
        blueprintId: 'item/rift-town/golden-salve',
        name: '金疮药',
        short: '常见外伤药，止血消肿',
        price: 28,
        stock: -1,
      },
    ]);
    this.set('shop_recycle', {
      enabled: true,
      // 药师只收药材/药品/可入药食材，不收兵器甲胄
      allowedTypes: ['medicine', 'food'],
      deniedTypes: ['weapon', 'armor', 'book', 'container', 'key', 'misc'],
      priceRate: 0.55,
      minPrice: 1,
      rejectionMessage: '白发药师淡淡道：「老身只收药品与可入药之物，其它拿走。」',
    });
  }

  /**
   * 接收物品钩子 — 接受任务物品（type=quest），拒绝其余
   */
  onReceiveItem(_giver: LivingBase, item: ItemBase): { accept: boolean; message?: string } {
    if (item.getType() === 'quest') {
      return {
        accept: true,
        message: '白发药师接过信，微微颔首：「嗯，老周的信……老身知道了。多谢你跑这一趟。」',
      };
    }
    return {
      accept: false,
      message: '白发药师头也不抬：「老身不需要这个，别打扰我做药。」',
    };
  }
}
