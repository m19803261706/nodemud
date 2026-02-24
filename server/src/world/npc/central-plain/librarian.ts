/**
 * 许鹤年 — 洛阳废都·藏书阁残迹
 * 自封的藏书守护者，从废墟中抢救残书，视书如命，不准带走
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class Librarian extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '许鹤年');
    this.set('short', '一个戴着老花镜的白发老者');
    this.set(
      'long',
      '一位六旬上下的老者，发色纯白，梳得整整齐齐，戴着一副用铁丝绑好的老花镜，' +
        '镜片有一道裂纹，用细麻线缠着将就着用。' +
        '衣衫洗得发白，袖口有补丁，但折叠整齐，一丝不苟。' +
        '他叫许鹤年，曾在哪里当过书吏或教书先生，已无从考证，' +
        '但他对残书的态度说明了一切——每一卷都值得被好好对待，哪怕它已经快散架了。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 8);
    this.set('max_hp', 250);
    this.set('hp', 250);
    this.set('personality', 'scholarly');
    this.set('speech_style', 'scholarly');
    this.set('chat_chance', 45);
    this.set('chat_msg', [
      '许鹤年小心翼翼地翻开一卷泛黄的古籍，嘴里念念有词，像是在逐字逐句地核对什么。',
      '许鹤年用竹签给一卷书做了标记，叹了口气：「又蛀了三页……」他随即翻出针线，开始修补书页。',
      '许鹤年整理书架，动作轻柔得像在抱孩子，每摆一卷都要停下来检查一遍竹签标注是否还在。',
    ]);
    this.set('inquiry', {
      藏书:
        '许鹤年推了推老花镜，目光亮了一下：「这里原有万卷藏书，我救回来的不到十分之一。每救一卷我都登记造册——」他拍了拍身旁厚厚的册子，「等有朝一日……」他没说完，像是连自己也不确定那一日会不会到来，又低头去翻书了。',
      门派:
        '许鹤年翻出一卷残册，抖了抖灰尘：「各派的功法秘籍？那些早就被抢光了，第一批走的就是那些。留下的都是经史子集、地方志和匠术笔记——在那些人眼里不值钱的东西。」他停顿了一下，「在我眼里，是无价的。」',
      default:
        '许鹤年看了你一眼，放下手中的书：「想看书可以，在这里看，不准带走。」他补充道，「弄坏了……」他没说后果，但那双眼睛透过裂镜片盯着你，表情极为认真。',
    });
  }
}
