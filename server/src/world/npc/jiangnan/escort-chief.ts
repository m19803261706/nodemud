/**
 * 镖头赵铁柱 — 烟雨镇·顺风镖局
 * 镖局总镖头，性格刚直，武艺扎实
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class EscortChief extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '赵铁柱');
    this.set('short', '虎背熊腰的镖局总镖头');
    this.set(
      'long',
      '赵铁柱身高九尺，膀大腰圆，一张国字脸上横着一道从左眉角划到右颊的旧疤，' +
        '据说是早年跑镖时被山贼留下的纪念。他穿着一件深棕色的皮甲，' +
        '腰间挂着一把朴刀，刀鞘磨损严重，显然不是摆设。' +
        '他说话声如洪钟，笑起来也是震天响。' +
        '在烟雨镇跑了二十年镖，从没丢过一趟货，' +
        '靠的不是运气，是一身过硬的武艺和一帮肝胆相照的兄弟。',
    );
    this.set('title', '顺风镖局 总镖头');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '顺风镖局');
    this.set('attitude', 'friendly');
    this.set('level', 12);
    this.set('max_hp', 550);
    this.set('hp', 550);
    this.set('combat_exp', 0);
    this.set('personality', 'bold');
    this.set('speech_style', 'blunt');
    this.set('chat_chance', 40);
    this.set('chat_msg', [
      '赵铁柱抽出朴刀擦拭刀身，每一下都用力而仔细。',
      '赵铁柱指导年轻镖师的刀法，声音粗犷：「手腕要稳！」',
      '赵铁柱盘腿坐在院中运功调息，周身隐隐有热气蒸腾。',
      '赵铁柱查看镖车上的货物，确认每一件都绑得牢固。',
    ]);
    this.set('inquiry', {
      镖局:
        '赵铁柱拍了拍胸膛：「顺风镖局，走的就是个信字。' +
        '货交到我手上，就是天塌下来也给你送到。' +
        '这二十年，从没丢过一趟。问谁都知道。」',
      匪患:
        '赵铁柱皱了皱眉，疤痕跟着扭曲：' +
        '「最近南边那条水路不太平，听说有帮水匪在那一带活动。' +
        '我已经让兄弟们多加小心了。' +
        '你若是走那条路，最好结伴同行，落单可不好办。」',
      default:
        '赵铁柱上下打量你一眼，点了点头：「是走江湖的吧？' +
        '看你的步法还行。我们镖局有时候缺人手，' +
        '你要是感兴趣，可以来试试。报酬不会亏待你。」',
    });
  }
}
