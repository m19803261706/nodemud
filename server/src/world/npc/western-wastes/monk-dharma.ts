/**
 * 密宗行者达摩旃 — 黄沙驿·禅修帐
 * 密宗武僧，修行者，话少而深刻，以问题代替回答
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class MonkDharma extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '达摩旃');
    this.set('short', '一位在帐中打坐的暗红色法衣僧侣');
    this.set(
      'long',
      '他盘坐在旧毡上，法衣是暗红色，洗了很多次，颜色已经褪淡，但干净整洁。' +
        '剃度的头颅映出帐顶那一线天光，眉间有一个用灰烬点成的圆点，是密宗修行者的标志。' +
        '他的手相当大，掌纹深刻，手背有几道浅疤，是多年练拳留下的。' +
        '打坐时，他整个人像是一块镶在这顶帐篷里的石头，' +
        '但一旦开口，声音低沉而有力，每一个字都像是经过考量。' +
        '据丝路上的商人说，他在这里已经待了三年，到底在等什么，谁也不知道。',
    );
    this.set('title', '行者');
    this.set('gender', 'male');
    this.set('faction', Factions.XI_YU);
    this.set('visible_faction', '密宗');
    this.set('attitude', 'friendly');
    this.set('level', 22);
    this.set('max_hp', 1000);
    this.set('hp', 1000);
    this.set('personality', 'stern');
    this.set('speech_style', 'scholarly');
    this.set('chat_chance', 25);
    this.set('chat_msg', [
      '达摩旃闭目打坐，嘴唇微动，是在默念还是只是呼吸，看不出来。',
      '达摩旃缓缓睁开眼睛，看向来人，片刻后又重新闭上。',
      '达摩旃把一颗念珠在指间转过，沉默地坐着，仿佛这顶帐篷里只有他一个人。',
      '达摩旃呼出一口气，那一刻，帐篷里似乎变得更静了。',
    ]);
    this.set('inquiry', {
      武学: '达摩旃睁开眼，说道：「武学之道，在心不在拳。力气可以练大，但心若乱，力气只是伤人的工具，非道。」',
      试炼: '达摩旃单掌竖起：「你想学？」他停顿了一下，「先回答我三个问题——你修行为何？你怕什么？你愿意为此放下什么？」',
      密宗: '达摩旃道：「密宗讲求身口意三业清净，武学只是身业的一部分。你若只想学打架，我帮不了你。」',
      达摩旃: '达摩旃平静道：「名字不重要，重要的是你为何而来。」',
      default: '达摩旃单掌竖于胸前，微微低头：「施主有礼。」',
    });
  }
}
