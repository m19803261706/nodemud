/**
 * 杂货商 — 裂隙镇杂货铺
 * 东海散盟的商人，经营日常用品
 */
import { Factions } from '@packages/core';
import { MerchantBase } from '../../../engine/game-objects/merchant-base';
import type { PlayerBase } from '../../../engine/game-objects/player-base';
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class Merchant extends MerchantBase {
  static virtual = false;

  create() {
    this.set('name', '杂货商');
    this.set('short', '一个精明的中年商人');
    this.set(
      'long',
      '杂货铺老板是个精瘦的中年人，一双小眼睛滴溜溜地转，' +
        '嘴角永远挂着一丝职业化的微笑。他来自东海散盟，' +
        '据说在沿海一带做了多年买卖，后来跟着商队来到裂隙镇，' +
        '发现这里南来北往的人多，便留下来开了这间杂货铺。' +
        '铺子里什么都有，从油盐酱醋到绳索火折子，应有尽有。',
    );
    this.set('title', '裂隙镇');
    this.set('gender', 'male');
    this.set('faction', Factions.SAN_MENG);
    this.set('visible_faction', '散盟');
    this.set('attitude', 'neutral');
    this.set('level', 18);
    this.set('max_hp', 600);
    this.set('hp', 600);
    this.set('personality', 'cunning');
    this.set('speech_style', 'merchant');
    this.set('chat_chance', 12);
    this.set('chat_msg', [
      '杂货商正在盘点柜台上的货物。',
      '杂货商朝路过的行人招手：「看看，刚到的好货。」',
      '杂货商拨弄着算盘珠子，噼里啪啦地算着账。',
      '杂货商对着账本嘀咕：「这批货的利头比上月薄了……」',
    ]);
    this.set('inquiry', {
      买卖: (asker) => {
        const title = this.getPlayerTitle(asker as PlayerBase);
        return `杂货商眉开眼笑：「${title}要买什么？咱们铺子里东西全，价格公道。药品、食物、杂物，应有尽有。」`;
      },
      散盟: '杂货商笑道：「东海散盟嘛，说白了就是做买卖的。从东边运货到西边，再从西边带货回去。散盟的规矩就一条——诚信经商，童叟无欺。」',
      消息: '杂货商压低嗓门：「最近从北边来的商队少了不少，好像是那边出了什么事。货少了价格就高了，要买什么趁早。」',
      default: (asker) => {
        const title = this.getPlayerTitle(asker as PlayerBase);
        return `杂货商摊摊手：「${title}，这个嘛，不是小人能说上话的事情。不如看看咱的货？」`;
      },
    });
    this.set('shop_goods', [
      {
        blueprintId: 'item/rift-town/dry-rations',
        name: '干粮',
        short: '一包便于携带的干粮',
        price: 12,
        stock: -1,
      },
      {
        blueprintId: 'item/rift-town/small-pouch',
        name: '小包裹',
        short: '一个结实的小布包，可收纳随身杂物',
        price: 45,
        stock: 3,
      },
      {
        blueprintId: 'item/rift-town/cloth-armor',
        name: '布衣',
        short: '普通旅人常穿的布衣',
        price: 80,
        stock: 2,
      },
    ]);
    this.set('shop_recycle', {
      enabled: true,
      // 杂货商只收日用杂货，不收武器防具与秘籍
      allowedTypes: ['food', 'container', 'misc', 'key'],
      deniedTypes: ['weapon', 'armor', 'book'],
      priceRate: 0.45,
      minPrice: 1,
      rejectionMessage: '杂货商摆手道：「刀剑甲胄你去铁匠那边问吧，我这里只收杂货。」',
    });
  }

  /** 玩家进入杂货铺时偶尔招揽 */
  onPlayerEnter(player: PlayerBase): void {
    if (Math.random() > 0.15) return;
    const title = this.getPlayerTitle(player);
    const env = this.getEnvironment();
    if (env && env instanceof RoomBase) {
      env.broadcast(
        `[npc]${this.getName()}[/npc]眼前一亮，殷勤地招呼道：「${title}，来得正好！刚到一批新货，看看有没有中意的？」`,
      );
    }
  }
}
