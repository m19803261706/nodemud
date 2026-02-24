/**
 * 情报贩子刘三指 — 烟雨镇·水下暗道
 * 在暗道中进行情报交易的中间人，三根指头是他的标志
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class SmugglerLiu extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '刘三指');
    this.set('short', '缺了两根手指的瘦削男子');
    this.set(
      'long',
      '刘三指是个干瘦的中年人，左手只剩下三根指头，' +
        '据说另外两根是当年做错了一笔买卖被人砍掉的。' +
        '他穿着一件油光发亮的黑布短褂，头上戴着一顶低檐斗笠，' +
        '帽沿压得极低，很难看清他的眼睛。' +
        '说话时嘴角总是歪着，声音沙哑，像是喉咙里卡了根刺。' +
        '他在这条暗道里混了十几年，什么消息都能弄到，' +
        '只要你出得起价。他的规矩只有一条：给钱办事，绝不出卖买家。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'neutral');
    this.set('level', 10);
    this.set('max_hp', 400);
    this.set('hp', 400);
    this.set('combat_exp', 0);
    this.set('personality', 'cunning');
    this.set('speech_style', 'sly');
    this.set('chat_chance', 20);
    this.set('chat_msg', [
      '刘三指倚在石墙上，用仅剩的三根手指翻着几枚铜钱，动作灵巧得不像残疾人。',
      '刘三指低声跟一个蒙面人交谈了几句，对方塞了个布包给他便匆匆离去。',
      '刘三指点燃一根旱烟，昏暗中烟头的红点像一只幽灵的眼睛。',
    ]);
    this.set('inquiry', {
      消息:
        '刘三指嘿嘿一笑，举起左手晃了晃那三根手指：' +
        '「消息嘛，什么样的都有。但三指的规矩你也知道——' +
        '先看银子，后听话。空口白牙套消息的，恕不奉陪。」',
      暗道:
        '刘三指压低了声音：「这条暗道通往哪里，你不需要知道。' +
        '你只需要知道，在这里你能买到别处买不到的东西。' +
        '当然……价钱也是别处比不了的。」',
      default:
        '刘三指从帽沿下射出一道冷光：「做买卖的就坐下谈，' +
        '不做买卖的就原路回去。这地方不适合闲逛。」',
    });
  }
}
