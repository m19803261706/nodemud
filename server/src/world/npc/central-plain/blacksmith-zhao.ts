/**
 * 铁匠赵铁 — 洛阳废都·铁匠巷
 * 废都最后一个铁匠，脾气粗糙，技艺扎实，不走是因为无处可去
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class BlacksmithZhao extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '赵铁');
    this.set('short', '一个胳膊粗壮、满脸烟灰的汉子');
    this.set(
      'long',
      '一个年约四旬的粗壮汉子，两条胳膊像是锻铁锻出来的，布满筋络和旧伤。' +
        '脸上涂了一层洗不干净的烟灰，让他的表情永远比实际情绪更严肃。' +
        '皮革围裙上烙着大大小小的火星痕迹，皮靴的鞋头已经被炉渣烫硬。' +
        '他叫赵铁，这个名字本身就像一块没有废话的铁胚。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 14);
    this.set('max_hp', 500);
    this.set('hp', 500);
    this.set('personality', 'grumpy');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 30);
    this.set('chat_msg', [
      '赵铁挥锤敲打着一块铁胚，火星四溅，啪啪声在空巷里回响。',
      '赵铁往水桶里淬了一下刚打好的刀，滋的一声白烟升起，他眯眼看了看成色，微微点头。',
      '赵铁擦了把汗，端起炉边的碗，把凉茶一口灌下，随手把碗搁回去，又低头干活。',
    ]);
    this.set('inquiry', {
      打造:
        '赵铁瞥了你一眼：「修兵器还是打新的？修的话放这儿明天来取，打新的看你出什么料。巧妇难为无米之炊。」他说完低下头，继续敲他的铁胚。',
      废都:
        '赵铁哼了一声：「走了也没处去，不走至少还有口饭吃。这条巷子从前三十多家铁匠铺，现在就我一家。」他顿了顿，「就我一家。」',
      default:
        '赵铁头也不抬：「站远点，小心火星。有事说事，没事别挡着光。」',
    });
  }
}
