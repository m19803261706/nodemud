/**
 * 香料商阿里木 — 黄沙驿·香料摊
 * 来自极西之地的香料商人，精通各种香料的产地与用途
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class SpiceMerchant extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '阿里木');
    this.set('short', '一个戴着高帽的西域香料商人');
    this.set(
      'long',
      '他戴着一顶毛毡高帽，帽子上缠着金线，在阳光下闪闪发亮。' +
        '鹰钩鼻，深眼窝，胡须修剪得整整齐齐，是极西之地的面相。' +
        '他身上混合着数十种香料的气味，走到哪里都带着一股浓烈的芬芳。' +
        '手指常年被番红花和姜黄染成黄色，怎么洗都洗不掉。' +
        '他做生意时表情严肃，但一谈到香料的来历和故事，' +
        '立刻变得滔滔不绝，眼睛里放光，像是在说自己的孩子。' +
        '据说他的商路从极西的海港一直延伸到长安，每年走一个来回。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.XI_YU);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 12);
    this.set('max_hp', 400);
    this.set('hp', 400);
    this.set('personality', 'enthusiastic');
    this.set('speech_style', 'merchant');
    this.set('chat_chance', 35);
    this.set('chat_msg', [
      '阿里木把一小撮番红花举到鼻子前深深吸了一口，脸上露出陶醉的表情。',
      '阿里木正在给一位买家讲解胡椒的等级，声音越说越大，手势越比越夸张。',
      '阿里木用小铜秤仔细称量香料，每一粒都数得清清楚楚。',
      '阿里木展开一块布，上面画着从极西到中原的香料贸易路线图，标记密密麻麻。',
    ]);
    this.set('inquiry', {
      香料: '阿里木两眼放光：「你问对人了！番红花产自高原，胡椒来自南海，丁香是岛国的宝贝——每一种香料背后都有一条血与汗的路。你要听哪一种？」',
      价格: '阿里木竖起一根手指：「好东西不便宜。上等番红花一两黄金一克，因为要八万朵花才能采一斤。便宜的那是掺了染料的假货。」',
      远方: '阿里木眺望西方：「极西之地有蓝色的海，海边有白色的城，城里的人用橄榄油和香料做饭，味道和中原完全不同。」他叹口气，「已经三年没回去了。」',
      default:
        '阿里木热情地招呼：「朋友，来闻闻这个！」他把一把肉桂塞到你鼻子前，「从南方雨林来的，三个月的路程，香不香？」',
    });
  }
}
