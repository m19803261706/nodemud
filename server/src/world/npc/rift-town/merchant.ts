/**
 * 杂货商 — 裂隙镇杂货铺
 * 东海散盟的商人，经营日常用品
 */
import { Factions } from '@packages/core';
import { MerchantBase } from '../../../engine/game-objects/merchant-base';

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
    this.set('chat_chance', 12);
    this.set('chat_msg', [
      '杂货商正在盘点柜台上的货物。',
      '杂货商朝你招手：「客官看看，刚到的好货。」',
      '杂货商拨弄着算盘珠子，噼里啪啦地算着账。',
    ]);
    this.set('inquiry', {
      买卖: '杂货商眉开眼笑：「客官要买什么？咱们铺子里东西全，价格公道。药品、食物、杂物，应有尽有。」',
      散盟: '杂货商笑道：「东海散盟嘛，说白了就是做买卖的。从东边运货到西边，再从西边带货回去。散盟的规矩就一条——诚信经商，童叟无欺。」',
      消息: '杂货商压低嗓门：「最近从北边来的商队少了不少，好像是那边出了什么事。货少了价格就高了，你要买什么趁早。」',
      default: '杂货商摊摊手：「这个嘛，不是小人能说上话的事情。客官不如看看咱的货？」',
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
  }
}
