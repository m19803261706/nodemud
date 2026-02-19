/**
 * 店小二 — 裂隙镇客栈
 * 负责收房钱并放客人上楼歇息
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';
import type { PlayerBase } from '../../../engine/game-objects/player-base';

const INN_ROOM_PRICE = 18;

export default class InnWaiter extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '店小二');
    this.set('short', '一个手脚麻利的店小二');
    this.set(
      'long',
      '这店小二年纪不大，却眼明手快，肩上搭着一条半旧布巾。' +
        '他在桌椅间来回穿梭，见你望向楼梯，便下意识把手按在扶手前。',
    );
    this.set('title', '裂隙镇');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 8);
    this.set('max_hp', 260);
    this.set('hp', 260);
    this.set('can_rent_room', true);
    this.set('rent_price', INN_ROOM_PRICE);
    this.set('personality', 'friendly');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 12);
    this.set('chat_msg', [
      '店小二把茶盏一一摆正，顺手抹去桌沿水痕。',
      '店小二朝楼梯努努嘴：「住店的客官，先到我这儿交个房钱。」',
      `店小二笑道：「二楼包间一晚只要 ${INN_ROOM_PRICE} 两银子，干净安静。」`,
      '店小二手脚麻利地收拾着桌上的残茶冷盏。',
    ]);
    this.set('inquiry', {
      住店: (asker) => {
        const title = this.getPlayerTitle(asker as PlayerBase);
        return `店小二低声道：「${title}，二楼包间 ${INN_ROOM_PRICE} 两银子，交了钱我就放你上楼歇息。」`;
      },
      休息: `店小二点头道：「交 ${INN_ROOM_PRICE} 两房钱，上楼便可安稳调息。」`,
      房钱: `店小二掂了掂算盘：「本店包间一口价，${INN_ROOM_PRICE} 两银子。」`,
      default: (asker) => {
        const title = this.getPlayerTitle(asker as PlayerBase);
        return `店小二挠挠头：「${title}若要住店歇脚，我这就能给你安排。」`;
      },
    });

    // 漫游：店小二在客栈楼上楼下穿梭
    this.set('wander', {
      chance: 8, // 每心跳 8% 概率（平均 ~25s 移动一次，体现忙碌穿梭）
      rooms: ['area/rift-town/inn', 'area/rift-town/inn-upstairs'],
    });
  }
}
