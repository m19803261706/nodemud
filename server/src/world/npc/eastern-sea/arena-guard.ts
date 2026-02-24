/**
 * 斗兽场看守铁牙 — 潮汐港·斗兽场
 * 负责管理斗兽场的粗暴汉子，身上满是猛兽留下的伤痕
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class ArenaGuard extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '铁牙');
    this.set('short', '坐在笼子旁啃骨头的壮汉');
    this.set(
      'long',
      '铁牙是个高大到不像话的壮汉，满脸络腮胡，' +
        '一口门牙全没了，只剩两颗犬齿，笑起来像一头野兽。' +
        '他的身上到处是被爪子抓出的伤疤，最深的一道从左肩划到右腰，' +
        '据说是被一头从南海运来的鳄鱼咬的。' +
        '他穿着一件用兽皮拼成的坎肩，腰间挂着铁链和皮鞭，' +
        '手里啃着不知哪种动物的骨头，啃得嘎嘣作响。' +
        '斗兽场里的猛兽见了他都缩到笼子角落——' +
        '不是怕他厉害，是怕他抽鞭子。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.SAN_MENG);
    this.set('visible_faction', '潮汐港');
    this.set('attitude', 'neutral');
    this.set('level', 20);
    this.set('max_hp', 900);
    this.set('hp', 900);
    this.set('combat_exp', 0);
    this.set('personality', 'aggressive');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 30);
    this.set('chat_msg', [
      '铁牙把骨头丢进笼子里，笼中的猛兽立刻扑上去争抢。',
      '铁牙甩了一下鞭子，笼子里的野兽吓得往后缩了缩。',
      '铁牙嘿嘿笑着拍了拍肚皮，发出瓮声瓮气的响动。',
    ]);
    this.set('inquiry', {
      斗兽: '铁牙呲着两颗犬齿笑了：「想看斗兽？晚上来，最精彩。最近新抓了头山里的黑熊，三天没喂了，上场肯定凶。要不——你也下去试试？」',
      猛兽: '铁牙拍了拍笼子的铁栏：「这些畜生比人好对付，它们饿了就想吃东西，很简单。人可不一样，人饿了什么都干得出来。」',
      default: '铁牙歪头打量你：「你长得不够壮。不过没关系，斗兽场不挑体型，就看你敢不敢。」',
    });
  }
}
